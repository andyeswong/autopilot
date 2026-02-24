export interface Variable {
	name: string;
	value: string;
	is_secret: boolean;
}

export interface TestCase {
	start_url: string;
	user_story: string;
}

export interface Context {
	variables: Variable[];
}

export interface Scenario {
	id: string;
	name: string;
	description?: string;
	context: Context;
	cases: TestCase[];
	createdAt: string;
	updatedAt: string;
}

export type RunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface TestResult {
	id: string;
	caseIndex: number;
	userStory: string;
	startUrl: string;
	passed: boolean;
	reason: string;
	durationMs: number;
	createdAt: string;
}

export interface TestRun {
	id: string;
	scenarioId?: string;
	scenario?: Pick<Scenario, 'id' | 'name'>;
	snapshotCases: TestCase[];
	snapshotVariables: Variable[];
	status: RunStatus;
	createdAt: string;
	completedAt?: string;
	results: TestResult[];
}

// Socket.IO event payloads
export interface EvtTestStarted {
	runId: string;
	totalCases: number;
}
export interface EvtCaseStarted {
	runId: string;
	caseIndex: number;
	userStory: string;
}
export interface EvtCaseCompleted {
	runId: string;
	caseIndex: number;
	passed: boolean;
	reason: string;
	durationMs: number;
}
export interface EvtTestFinished {
	runId: string;
	summary: { passed: number; failed: number; total: number };
}
export interface EvtAgentLog {
	runId: string;
	message: string;
	level: 'loading' | 'success' | 'failure' | 'info';
}
