import { TaskManagerService } from '@/core/services/task-manager-service';
import { ManagerAgent } from '@/core/agents/manager-agent/manager-agent';
import { DomService } from '@/infra/services/dom-service';
import { createLLM } from '@/infra/services/llm-factory';
import { InMemoryFileSystem } from '@/infra/services/in-memory-file-system';
import { PlaywrightScreenshoter } from '@/infra/services/playwright-screenshotter';
import { ChromiumBrowser } from '@/infra/services/chromium-browser';
import { EvaluationAgent } from '@/core/agents/evaluation-agent/evaluation-agent';
import {
  DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
  DEFAULT_AGENT_MAX_RETRIES,
} from '@/core/agents/manager-agent/manager-agent.config';
import { WebSocketReporter } from '@/infra/services/websocket-reporter';
import { Variable } from '@/core/entities/variable';
import { EventsGateway } from '@/interfaces/api/gateway/events.gateway';

export interface ScenarioPayload {
  context: {
    variables: Array<{
      name: string;
      value: string;
      is_secret: boolean;
    }>;
  };
  cases: Array<{
    start_url: string;
    user_story: string;
  }>;
}

export interface CaseResult {
  caseIndex: number;
  userStory: string;
  startUrl: string;
  passed: boolean;
  reason: string;
  durationMs: number;
}

export class RunScenarioUseCase {
  constructor(private readonly eventsGateway: EventsGateway) {}

  async execute(runId: string, payload: ScenarioPayload): Promise<CaseResult[]> {
    const results: CaseResult[] = [];
    const { context, cases } = payload;

    this.eventsGateway.emitTestStarted(runId, cases.length);

    for (const [index, testCase] of cases.entries()) {
      const { start_url: startUrl, user_story: userStory } = testCase;

      this.eventsGateway.emitCaseStarted(runId, index, userStory);
      const startTime = Date.now();

      const fileSystem = new InMemoryFileSystem();
      const screenshotService = new PlaywrightScreenshoter(fileSystem);
      const browser = new ChromiumBrowser();
      const llm = createLLM();

      const evaluationAgent = new EvaluationAgent(
        llm,
        browser,
        screenshotService,
        new WebSocketReporter('Evaluation Agent', runId, this.eventsGateway),
      );

      const managerAgent = new ManagerAgent({
        variables: context.variables.map(
          (v) =>
            new Variable({
              name: v.name,
              value: v.value,
              isSecret: v.is_secret,
            }),
        ),
        reporter: new WebSocketReporter('Manager Agent', runId, this.eventsGateway),
        evaluator: evaluationAgent,
        taskManager: new TaskManagerService(),
        domService: new DomService(screenshotService, browser),
        browserService: browser,
        llmService: llm,
        maxActionsPerTask: DEFAULT_AGENT_MAX_ACTIONS_PER_TASK,
        maxRetries: DEFAULT_AGENT_MAX_RETRIES,
      });

      try {
        const result = await managerAgent.launch(startUrl, userStory);
        const durationMs = Date.now() - startTime;
        const passed = result.status === 'passed';

        this.eventsGateway.emitCaseCompleted(
          runId,
          index,
          passed,
          result.status,
          durationMs,
        );

        results.push({
          caseIndex: index,
          userStory,
          startUrl,
          passed,
          reason: result.status,
          durationMs,
        });
      } catch (error: any) {
        const durationMs = Date.now() - startTime;
        const reason = error?.message || 'Unknown error';

        this.eventsGateway.emitCaseCompleted(runId, index, false, reason, durationMs);

        results.push({
          caseIndex: index,
          userStory,
          startUrl,
          passed: false,
          reason,
          durationMs,
        });
      } finally {
        await browser.close();
      }
    }

    const summary = {
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      failed: results.filter((r) => !r.passed).length,
    };

    this.eventsGateway.emitTestFinished(runId, summary);

    return results;
  }
}
