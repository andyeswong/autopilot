import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RunsService } from './runs.service';
import { ScenarioPayload } from '@/app/usecases/run-scenario.usecase';

@Controller()
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  /**
   * Trigger a run for a saved scenario
   * POST /scenarios/:id/run
   */
  @Post('scenarios/:id/run')
  runScenario(@Param('id') id: string) {
    return this.runsService.runScenario(id);
  }

  /**
   * Trigger a run with an inline payload (no saved scenario)
   * POST /runs
   */
  @Post('runs')
  runInline(@Body() payload: ScenarioPayload) {
    return this.runsService.runInline(payload);
  }

  /**
   * List all runs
   * GET /runs
   */
  @Get('runs')
  findAll() {
    return this.runsService.findAll();
  }

  /**
   * Get run details with results
   * GET /runs/:id
   */
  @Get('runs/:id')
  findOne(@Param('id') id: string) {
    return this.runsService.findOne(id);
  }

  /**
   * Delete a run
   * DELETE /runs/:id
   */
  @Delete('runs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.runsService.remove(id);
  }
}
