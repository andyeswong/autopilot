<template>
  <div class="p-8">

    <!-- Header -->
    <div class="mb-7 flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Scenarios</h1>
        <p class="mt-1 text-sm" style="color:rgba(255,255,255,0.38)">Manage and run your automated test scenarios</p>
      </div>
      <RouterLink
        to="/scenarios/new"
        class="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
        style="background:#4f46e5;"
      >
        + New Scenario
      </RouterLink>
    </div>

    <!-- Stats row -->
    <div class="mb-7 grid grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label"
           class="rounded-xl p-4"
           style="background:#151f30;border:1px solid rgba(255,255,255,0.07);">
        <p class="text-xs font-semibold uppercase tracking-widest mb-2" style="color:rgba(255,255,255,0.30)">{{ stat.label }}</p>
        <p class="text-2xl font-bold" :style="stat.color ? `color:${stat.color}` : 'color:white'">{{ stat.value }}</p>
      </div>
    </div>

    <p v-if="loading" class="text-sm" style="color:rgba(255,255,255,0.40)">Loading...</p>
    <p v-else-if="error" class="text-sm" style="color:#f87171">{{ error }}</p>

    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

      <!-- Scenario cards -->
      <div
        v-for="s in scenarios"
        :key="s.id"
        class="rounded-xl overflow-hidden flex flex-col"
        style="background:#151f30;border:1px solid rgba(255,255,255,0.07);"
      >
        <!-- Colored top stripe -->
        <div class="h-1 w-full" :style="`background:${healthColor(s.id)}`"></div>

        <div class="p-5 flex flex-col flex-1">
          <!-- Title row -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-2 h-2 rounded-full shrink-0" :style="`background:${healthColor(s.id)}`"></div>
              <h2 class="font-semibold text-white text-sm truncate">{{ s.name }}</h2>
            </div>
            <span class="ml-2 shrink-0 rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide"
                  :style="healthBadgeStyle(s.id)">
              {{ healthLabel(s.id) }}
            </span>
          </div>

          <!-- Meta rows -->
          <div class="space-y-2 mb-5 text-sm">
            <div class="flex justify-between">
              <span style="color:rgba(255,255,255,0.38)">Cases</span>
              <span class="font-medium text-white">{{ s.cases.length }} Case{{ s.cases.length === 1 ? '' : 's' }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:rgba(255,255,255,0.38)">Last Run</span>
              <span class="font-medium text-white">{{ lastRunTime(s.id) }}</span>
            </div>
            <div class="flex justify-between">
              <span style="color:rgba(255,255,255,0.38)">Pass Rate</span>
              <span class="font-medium" :style="passRateColor(passRate(s.id))">{{ passRateLabel(s.id) }}</span>
            </div>
          </div>

          <!-- Buttons 2×2 -->
          <div class="grid grid-cols-2 gap-2 mt-auto">
            <button
              @click="runScenario(s.id)"
              :disabled="running === s.id"
              class="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-40"
              style="background:#4f46e5;"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><path d="M2 1.5l7 3.5-7 3.5V1.5z"/></svg>
              {{ running === s.id ? 'Starting…' : 'Run' }}
            </button>
            <RouterLink
              :to="`/scenarios/${s.id}`"
              class="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-opacity hover:opacity-85"
              style="background:#1e2d45;color:rgba(255,255,255,0.70);border:1px solid rgba(255,255,255,0.10);"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4">
                <circle cx="6" cy="6" r="4"/><path d="M6 4v2.5l1.5 1.5"/>
              </svg>
              View
            </RouterLink>
            <RouterLink
              :to="`/scenarios/${s.id}/edit`"
              class="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-opacity hover:opacity-85"
              style="background:#1e2d45;color:rgba(255,255,255,0.70);border:1px solid rgba(255,255,255,0.10);"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M8 1.5l1.5 1.5-7 7H1v-1.5l7-7z"/>
              </svg>
              Edit
            </RouterLink>
            <button
              @click="deleteScenario(s.id, s.name)"
              class="flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-opacity hover:opacity-85"
              style="background:rgba(239,68,68,0.10);color:#f87171;border:1px solid rgba(239,68,68,0.25);"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.4">
                <path d="M2 3h7M4.5 3V2h2v1M4 3v6M7 3v6M2.5 3l.5 6h5l.5-6"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Create new card -->
      <RouterLink
        to="/scenarios/new"
        class="rounded-xl flex flex-col items-center justify-center gap-3 min-h-[210px] transition-opacity hover:opacity-80"
        style="background:#151f30;border:2px dashed rgba(255,255,255,0.12);"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-full"
             style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="rgba(255,255,255,0.45)" stroke-width="1.6">
            <path d="M9 4v10M4 9h10" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold text-white/70">Create New Scenario</p>
          <p class="text-xs mt-1" style="color:rgba(255,255,255,0.30)">Define a new automated test suite for your application</p>
        </div>
      </RouterLink>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { api } from '@/lib/api';
import type { Scenario, TestRun } from '@/lib/types';

const scenarios = ref<Scenario[]>([]);
const runs = ref<TestRun[]>([]);
const loading = ref(true);
const error = ref('');
const running = ref('');

onMounted(async () => {
  try {
    [scenarios.value, runs.value] = await Promise.all([api.scenarios.list(), api.runs.list()]);
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

// ── Stats row ────────────────────────────────────────────────────────────────

const stats = computed(() => {
  const since24h = Date.now() - 86_400_000;
  const recent = runs.value.filter(r => r.status === 'completed' && new Date(r.createdAt).getTime() > since24h);
  let passed24h: string = '—';
  if (recent.length) {
    let t = 0, p = 0;
    for (const r of recent) { t += r.results.length; p += r.results.filter(x => x.passed).length; }
    if (t) passed24h = `${Math.round((p / t) * 100)}%`;
  }
  const active = runs.value.filter(r => r.status === 'running').length;
  const completed = runs.value.filter(r => r.status === 'completed' && r.completedAt);
  let avg = '—';
  if (completed.length) {
    const ms = completed.reduce((a, r) => a + (new Date(r.completedAt!).getTime() - new Date(r.createdAt).getTime()), 0) / completed.length;
    avg = ms < 60000 ? `${Math.round(ms / 1000)}s` : `${(ms / 60000).toFixed(1)}m`;
  }
  return [
    { label: 'Total Scenarios', value: scenarios.value.length, color: '' },
    { label: 'Passed (24h)',    value: passed24h,              color: passed24h !== '—' ? '#4ade80' : '' },
    { label: 'Active Runs',     value: active || '—',          color: active ? '#818cf8' : '' },
    { label: 'Avg. Execution',  value: avg,                    color: '' },
  ];
});

// ── Per-scenario helpers ─────────────────────────────────────────────────────

function scenarioRuns(id: string) {
  return runs.value.filter(r => r.scenarioId === id && r.status === 'completed');
}

function passRate(id: string): number | null {
  const sr = scenarioRuns(id);
  if (!sr.length) return null;
  const last = sr[0]; // sorted descending
  if (!last.results.length) return null;
  return Math.round((last.results.filter(r => r.passed).length / last.results.length) * 100);
}

function healthLabel(id: string) {
  const r = passRate(id);
  if (r === null) return 'Unknown';
  return r >= 80 ? 'Healthy' : 'Failing';
}

function healthColor(id: string) {
  const r = passRate(id);
  if (r === null) return 'rgba(255,255,255,0.18)';
  return r >= 80 ? '#22c55e' : '#ef4444';
}

function healthBadgeStyle(id: string) {
  const r = passRate(id);
  if (r === null) return 'background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.35)';
  return r >= 80
    ? 'background:rgba(34,197,94,0.15);color:#4ade80'
    : 'background:rgba(239,68,68,0.15);color:#f87171';
}

function lastRunTime(id: string) {
  const sr = scenarioRuns(id);
  if (!sr.length) return '—';
  const diff = Date.now() - new Date(sr[0].createdAt).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function passRateLabel(id: string) {
  const r = passRate(id);
  return r === null ? '—' : `${r}% Pass`;
}

function passRateColor(r: number | null) {
  if (r === null) return 'color:rgba(255,255,255,0.38)';
  return r >= 80 ? 'color:#4ade80' : 'color:#f87171';
}

// ── Actions ──────────────────────────────────────────────────────────────────

async function runScenario(id: string) {
  running.value = id;
  try {
    const { runId } = await api.scenarios.run(id);
    location.href = `/runs/${runId}`;
  } catch (e: any) {
    alert(`Failed to start run: ${e.message}`);
    running.value = '';
  }
}

async function deleteScenario(id: string, name: string) {
  if (!confirm(`Delete "${name}"?`)) return;
  await api.scenarios.delete(id);
  scenarios.value = scenarios.value.filter(s => s.id !== id);
}
</script>
