import type { Scenario, TestRun, TestCase, Context } from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		headers: { 'Content-Type': 'application/json' },
		...init
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`[${res.status}] ${text}`);
	}
	if (res.status === 204) return undefined as T;
	return res.json();
}

// ─── Scenarios ──────────────────────────────────────────────────────────────

export const api = {
	scenarios: {
		list: () => req<Scenario[]>('/scenarios'),
		get: (id: string) => req<Scenario>(`/scenarios/${id}`),
		create: (body: { name: string; description?: string; context: Context; cases: TestCase[] }) =>
			req<Scenario>('/scenarios', { method: 'POST', body: JSON.stringify(body) }),
		update: (id: string, body: Partial<Scenario>) =>
			req<Scenario>(`/scenarios/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
		delete: (id: string) => req<void>(`/scenarios/${id}`, { method: 'DELETE' }),
		run: (id: string) =>
			req<{ runId: string; status: string }>(`/scenarios/${id}/run`, { method: 'POST' })
	},

	runs: {
		list: () => req<TestRun[]>('/runs'),
		get: (id: string) => req<TestRun>(`/runs/${id}`),
		runInline: (body: { context: Context; cases: TestCase[] }) =>
			req<{ runId: string; status: string }>('/runs', { method: 'POST', body: JSON.stringify(body) }),
		delete: (id: string) => req<void>(`/runs/${id}`, { method: 'DELETE' })
	}
};
