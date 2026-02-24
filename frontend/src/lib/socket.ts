import { io, type Socket } from 'socket.io-client';
import type {
	EvtTestStarted,
	EvtCaseStarted,
	EvtCaseCompleted,
	EvtTestFinished,
	EvtAgentLog
} from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
	if (!socket) {
		socket = io(BASE, { autoConnect: true, transports: ['websocket', 'polling'] });
	}
	return socket;
}

export function disconnectSocket() {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}

export type RunEvents = {
	onStarted?: (e: EvtTestStarted) => void;
	onCaseStarted?: (e: EvtCaseStarted) => void;
	onCaseCompleted?: (e: EvtCaseCompleted) => void;
	onLog?: (e: EvtAgentLog) => void;
	onFinished?: (e: EvtTestFinished) => void;
	onError?: (e: { runId: string; error: string }) => void;
};

export function listenToRun(runId: string, handlers: RunEvents) {
	const s = getSocket();

	const filter =
		<T extends { runId: string }>(fn?: (e: T) => void) =>
		(e: T) => {
			if (e.runId === runId && fn) fn(e);
		};

	const h1 = filter<EvtTestStarted>(handlers.onStarted);
	const h2 = filter<EvtCaseStarted>(handlers.onCaseStarted);
	const h3 = filter<EvtCaseCompleted>(handlers.onCaseCompleted);
	const h4 = filter<EvtAgentLog>(handlers.onLog);
	const h5 = filter<EvtTestFinished>(handlers.onFinished);
	const h6 = filter<{ runId: string; error: string }>(handlers.onError);

	s.on('test:started', h1);
	s.on('test:case:started', h2);
	s.on('test:case:completed', h3);
	s.on('test:agent:log', h4);
	s.on('test:finished', h5);
	s.on('test:error', h6);

	return () => {
		s.off('test:started', h1);
		s.off('test:case:started', h2);
		s.off('test:case:completed', h3);
		s.off('test:agent:log', h4);
		s.off('test:finished', h5);
		s.off('test:error', h6);
	};
}
