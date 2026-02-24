import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestRunEntity } from '@/database/entities/test-run.entity';
import { TestResultEntity } from '@/database/entities/test-result.entity';
import { ScenarioEntity } from '@/database/entities/scenario.entity';
import { EventsGateway } from '@/interfaces/api/gateway/events.gateway';
import { RunScenarioUseCase, ScenarioPayload } from '@/app/usecases/run-scenario.usecase';

@Injectable()
export class RunsService {
  constructor(
    @InjectRepository(TestRunEntity)
    private readonly runsRepo: Repository<TestRunEntity>,
    @InjectRepository(TestResultEntity)
    private readonly resultsRepo: Repository<TestResultEntity>,
    @InjectRepository(ScenarioEntity)
    private readonly scenariosRepo: Repository<ScenarioEntity>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  findAll() {
    return this.runsRepo.find({
      order: { createdAt: 'DESC' },
      relations: ['results'],
    });
  }

  async findOne(id: string) {
    const run = await this.runsRepo.findOne({
      where: { id },
      relations: ['results', 'scenario'],
    });
    if (!run) throw new NotFoundException(`Run ${id} not found`);
    return run;
  }

  async remove(id: string) {
    const run = await this.findOne(id);
    return this.runsRepo.remove(run);
  }

  /**
   * Trigger a run from a saved scenario by ID
   */
  async runScenario(scenarioId: string) {
    const scenario = await this.scenariosRepo.findOne({ where: { id: scenarioId } });
    if (!scenario) throw new NotFoundException(`Scenario ${scenarioId} not found`);

    return this.startRun(
      { context: scenario.context, cases: scenario.cases },
      scenario,
    );
  }

  /**
   * Trigger a run from an inline payload (no saved scenario needed)
   */
  async runInline(payload: ScenarioPayload) {
    return this.startRun(payload, null);
  }

  private async startRun(payload: ScenarioPayload, scenario: ScenarioEntity | null) {
    // Create run record
    const run = this.runsRepo.create({
      scenarioId: scenario?.id ?? null,
      snapshotCases: payload.cases,
      snapshotVariables: payload.context.variables,
      status: 'running',
    });
    const savedRun = await this.runsRepo.save(run);

    // Execute async — do not await, let it run in background
    this.executeRun(savedRun.id, payload).catch((err) => {
      console.error(`Run ${savedRun.id} failed:`, err);
    });

    return { runId: savedRun.id, status: 'running' };
  }

  private async executeRun(runId: string, payload: ScenarioPayload) {
    try {
      const useCase = new RunScenarioUseCase(this.eventsGateway);
      const results = await useCase.execute(runId, payload);

      // Save results
      for (const r of results) {
        const result = this.resultsRepo.create({
          runId,
          caseIndex: r.caseIndex,
          userStory: r.userStory,
          startUrl: r.startUrl,
          passed: r.passed,
          reason: r.reason,
          durationMs: r.durationMs,
        });
        await this.resultsRepo.save(result);
      }

      await this.runsRepo.update(runId, {
        status: 'completed',
        completedAt: new Date(),
      });
    } catch (error: any) {
      this.eventsGateway.emitTestError(runId, error?.message || 'Unknown error');
      await this.runsRepo.update(runId, { status: 'failed', completedAt: new Date() });
    }
  }
}
