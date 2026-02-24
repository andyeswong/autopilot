import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  // ─── Emitters (Server → Client) ────────────────────────────────────────────

  emitTestStarted(runId: string, totalCases: number) {
    this.server.emit('test:started', { runId, totalCases });
  }

  emitCaseStarted(runId: string, caseIndex: number, userStory: string) {
    this.server.emit('test:case:started', { runId, caseIndex, userStory });
  }

  emitCaseCompleted(
    runId: string,
    caseIndex: number,
    passed: boolean,
    reason: string,
    durationMs: number,
  ) {
    this.server.emit('test:case:completed', {
      runId,
      caseIndex,
      passed,
      reason,
      durationMs,
    });
  }

  emitAgentLog(runId: string, message: string, level: 'loading' | 'success' | 'failure' | 'info' = 'info') {
    this.server.emit('test:agent:log', { runId, message, level });
  }

  emitTestFinished(runId: string, summary: { passed: number; failed: number; total: number }) {
    this.server.emit('test:finished', { runId, summary });
  }

  emitTestError(runId: string, error: string) {
    this.server.emit('test:error', { runId, error });
  }

  // ─── Listeners (Client → Server) ───────────────────────────────────────────

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'pong', data: 'pong' };
  }
}
