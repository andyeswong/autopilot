import { AgentReporter } from '@/core/interfaces/agent-reporter.interface';
import { EventsGateway } from '@/interfaces/api/gateway/events.gateway';

export class WebSocketReporter implements AgentReporter {
  constructor(
    private readonly name: string,
    private readonly runId: string,
    private readonly gateway: EventsGateway,
  ) {}

  success(message: string): void {
    this.gateway.emitAgentLog(this.runId, `[${this.name}] ${message}`, 'success');
  }

  failure(message: string): void {
    this.gateway.emitAgentLog(this.runId, `[${this.name}] ${message}`, 'failure');
  }

  loading(message: string): void {
    this.gateway.emitAgentLog(this.runId, `[${this.name}] ${message}`, 'loading');
  }

  info(message: string): void {
    this.gateway.emitAgentLog(this.runId, `[${this.name}] ${message}`, 'info');
  }
}
