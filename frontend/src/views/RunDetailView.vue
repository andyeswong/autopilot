<template>
  <div v-if="loading" class="flex h-full items-center justify-center text-sm" style="color:rgba(255,255,255,0.40)">Loading...</div>
  <div v-else-if="error" class="p-8 text-sm text-red-400">{{ error }}</div>
  <div v-else-if="run" class="p-8">
    <!-- Header -->
    <div class="mb-2">
      <RouterLink to="/runs" class="text-xs font-medium" style="color:rgba(255,255,255,0.45)">← Run History</RouterLink>
    </div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">{{ run.scenario?.name ?? 'Run' }}</h1>
        <p class="mt-0.5 text-xs" style="color:rgba(255,255,255,0.35)">{{ new Date(run.createdAt).toLocaleString() }}</p>
      </div>
      <span class="rounded-xl px-3 py-1.5 text-xs font-semibold" :style="statusStyle(run.status)">{{ run.status }}</span>
    </div>

    <!-- Progress bar -->
    <div v-if="run.status === 'running'" class="mb-6 rounded-2xl p-4" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);">
      <div class="mb-2 flex justify-between text-xs" style="color:rgba(255,255,255,0.45)">
        <span>{{ completedCount }} / {{ totalCases }} cases</span>
        <span>{{ passedCount }} passed</span>
      </div>
      <div class="h-1.5 w-full overflow-hidden rounded-full" style="background:rgba(255,255,255,0.10)">
        <div class="h-1.5 rounded-full transition-all duration-500"
             style="background:rgba(255,255,255,0.50)"
             :style="`width: ${progress}%`"></div>
      </div>
    </div>
    <div v-else class="mb-6 flex items-center gap-6 text-sm">
      <div class="rounded-xl px-4 py-2.5" style="background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.20);">
        <p class="text-xs" style="color:rgba(255,255,255,0.40)">Passed</p>
        <p class="text-lg font-bold text-green-400">{{ passedCount }}</p>
      </div>
      <div class="rounded-xl px-4 py-2.5" style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.20);">
        <p class="text-xs" style="color:rgba(255,255,255,0.40)">Failed</p>
        <p class="text-lg font-bold text-red-400">{{ totalCases - passedCount }}</p>
      </div>
      <div class="rounded-xl px-4 py-2.5" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);">
        <p class="text-xs" style="color:rgba(255,255,255,0.40)">Total</p>
        <p class="text-lg font-bold" style="color:rgba(255,255,255,0.70)">{{ totalCases }}</p>
      </div>
    </div>

    <!-- VNC Live Browser -->
    <div v-if="run.status === 'running'" class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:rgba(255,255,255,0.35)">Live Browser</h2>
        <button
          @click="showVnc = !showVnc"
          class="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
        >{{ showVnc ? 'Hide' : 'Show' }}</button>
      </div>
      <div v-if="showVnc" class="overflow-hidden rounded-2xl" style="height:480px;border:1px solid rgba(255,255,255,0.10);">
        <iframe :src="vncUrl" class="w-full h-full border-0" allow="fullscreen" />
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Cases -->
      <div class="lg:col-span-2 space-y-3">
        <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:rgba(255,255,255,0.35)">Test Cases</h2>
        <div v-for="(c, i) in run.snapshotCases" :key="i"
             class="rounded-2xl p-4 transition-all"
             :style="caseCardStyle(liveResults.get(i))">
          <div class="mb-2 flex items-start gap-3">
            <span class="mt-0.5 text-sm leading-5 font-mono font-bold w-4 text-center shrink-0"
                  :class="caseStatusIcon(liveResults.get(i)) === '✓' ? 'text-green-400' : caseStatusIcon(liveResults.get(i)) === '✕' ? 'text-red-400' : caseStatusIcon(liveResults.get(i)) === '◌' ? 'text-blue-400 animate-pulse' : 'text-white/30'"
            >{{ caseStatusIcon(liveResults.get(i)) }}</span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="rounded-lg px-2 py-0.5 text-xs font-semibold" style="background:rgba(255,255,255,0.10);color:rgba(255,255,255,0.60);">
                  Case {{ i + 1 }}
                </span>
                <span v-if="liveResults.get(i)?.durationMs" class="text-xs" style="color:rgba(255,255,255,0.35)">
                  {{ ((liveResults.get(i)?.durationMs ?? 0) / 1000).toFixed(1) }}s
                </span>
              </div>
              <p class="truncate font-mono text-xs mb-1" style="color:rgba(255,255,255,0.35)">{{ c.start_url }}</p>
              <p class="text-sm text-white/80">{{ c.user_story }}</p>
            </div>
          </div>
          <p v-if="liveResults.get(i)?.reason"
             class="ml-10 text-xs mt-2 rounded-lg px-3 py-1.5"
             style="background:rgba(0,0,0,0.20);color:rgba(255,255,255,0.50)">
            {{ liveResults.get(i)?.reason }}
          </p>
        </div>
      </div>

      <!-- Logs -->
      <div>
        <h2 class="mb-3 text-xs font-semibold uppercase tracking-widest" style="color:rgba(255,255,255,0.35)">Agent Log</h2>
        <p v-if="logs.length === 0" class="text-xs" style="color:rgba(255,255,255,0.35)">
          {{ run.status === 'running' ? 'Waiting for events...' : 'No logs captured.' }}
        </p>
        <div v-else class="max-h-[32rem] overflow-y-auto rounded-2xl p-3 space-y-0.5"
             style="background:rgba(0,0,0,0.40);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.07);"
             ref="logBox">
          <div v-for="(log, i) in logs" :key="i" class="flex items-start gap-2 py-0.5">
            <span class="mt-0.5 shrink-0 text-xs leading-4 font-bold" :class="logIconClass(log.level)">{{ logIcon(log.level) }}</span>
            <p class="text-xs leading-4 break-words min-w-0 flex-1" :class="logTextClass(log.level)">{{ log.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/lib/api';
import { listenToRun } from '@/lib/socket';
import type { TestRun } from '@/lib/types';

const route = useRoute();
const id = route.params.id as string;

const run = ref<TestRun | null>(null);
const loading = ref(true);
const error = ref('');
const logs = ref<Array<{ message: string; level: string }>>([]);
const liveResults = ref<Map<number, any>>(new Map());
const showVnc = ref(true);
let cleanup: (() => void) | null = null;
const logBox = ref<HTMLElement | null>(null);

const VNC_BASE = import.meta.env.VITE_VNC_URL ?? 'http://localhost:6080';
const vncUrl = `${VNC_BASE}/vnc.html?autoconnect=1&reconnect=1&password=secret&resize=scale&show_dot=true`;

onMounted(async () => {
  try {
    run.value = await api.runs.get(id);
    if (run.value.results) {
      for (let i = 0; i < run.value.results.length; i++) {
        liveResults.value.set(i, run.value.results[i]);
      }
    }
    if (run.value.status === 'running' || run.value.status === 'pending') {
      attachSocket();
    }
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => cleanup?.());

function attachSocket() {
  cleanup = listenToRun(id, {
    onCaseStarted(e) {
      logs.value.push({ message: `▶ Case ${e.caseIndex + 1} started`, level: 'info' });
      liveResults.value = new Map(liveResults.value.set(e.caseIndex, { status: 'running' }));
    },
    onCaseCompleted(e) {
      liveResults.value = new Map(liveResults.value.set(e.caseIndex, {
        status: e.passed ? 'passed' : 'failed',
        passed: e.passed,
        reason: e.reason,
        durationMs: e.durationMs
      }));
      logs.value.push({ message: `Case ${e.caseIndex + 1}: ${e.reason ?? (e.passed ? 'Passed' : 'Failed')}`, level: e.passed ? 'success' : 'failure' });
    },
    onLog(e) {
      logs.value.push({ message: e.message, level: e.level ?? 'info' });
      nextTick(() => {
        if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight;
      });
    },
    async onFinished(e) {
      logs.value.push({ message: `Finished — ${e.summary.passed}/${e.summary.total} passed`, level: 'info' });
      cleanup?.();
      cleanup = null;
      run.value = await api.runs.get(id);
    }
  });
}

const totalCases = computed(() => run.value?.snapshotCases.length ?? 0);
const completedCount = computed(() => [...liveResults.value.values()].filter((r: any) => r?.status === 'passed' || r?.status === 'failed').length);
const passedCount = computed(() => [...liveResults.value.values()].filter((r: any) => r?.passed).length);
const progress = computed(() => totalCases.value > 0 ? (completedCount.value / totalCases.value) * 100 : 0);

function caseStatusIcon(r: any) {
  if (!r) return '–';
  if (r.status === 'running') return '◌';
  return r.passed ? '✓' : '✕';
}

function caseCardStyle(r: any) {
  if (!r) return 'background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);';
  if (r.status === 'running') return 'background:rgba(59,130,246,0.10);border:1px solid rgba(59,130,246,0.25);';
  return r.passed
    ? 'background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.20);'
    : 'background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.20);';
}

function statusStyle(status: string) {
  if (status === 'running') return 'background:rgba(59,130,246,0.2);color:#93c5fd;';
  if (status === 'completed') return 'background:rgba(34,197,94,0.18);color:#86efac;';
  if (status === 'failed') return 'background:rgba(239,68,68,0.18);color:#fca5a5;';
  return 'background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);';
}

function logIcon(level: string) {
  if (level === 'success') return '✓';
  if (level === 'failure') return '✕';
  if (level === 'loading') return '▸';
  return '·';
}

function logIconClass(level: string) {
  if (level === 'success') return 'text-green-400';
  if (level === 'failure') return 'text-red-400';
  if (level === 'loading') return 'text-blue-400 animate-pulse';
  return 'text-gray-500';
}

function logTextClass(level: string) {
  if (level === 'success') return 'text-green-300';
  if (level === 'failure') return 'text-red-300';
  if (level === 'loading') return 'text-blue-200';
  return 'text-gray-400';
}
</script>
