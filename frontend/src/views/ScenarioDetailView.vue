<template>
  <div v-if="loading" class="flex h-full items-center justify-center text-sm" style="color:rgba(255,255,255,0.40)">Loading...</div>
  <div v-else-if="error" class="p-8 text-sm text-red-400">{{ error }}</div>
  <div v-else-if="scenario" class="p-8">
    <div class="mb-2">
      <RouterLink to="/" class="text-xs font-medium" style="color:rgba(255,255,255,0.45)">← Scenarios</RouterLink>
    </div>
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">{{ scenario.name }}</h1>
        <p v-if="scenario.description" class="mt-1 text-sm" style="color:rgba(255,255,255,0.45)">{{ scenario.description }}</p>
      </div>
      <div class="flex items-center gap-2">
        <RouterLink :to="`/scenarios/${id}/edit`"
          class="rounded-xl px-3 py-2 text-xs font-semibold transition-all"
          style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.65);border:1px solid rgba(255,255,255,0.10);"
        >Edit</RouterLink>
        <button @click="del"
          class="rounded-xl px-3 py-2 text-xs font-semibold transition-all"
          style="background:rgba(239,68,68,0.12);color:rgba(252,165,165,0.90);border:1px solid rgba(239,68,68,0.20);"
        >Delete</button>
        <button @click="run" :disabled="running"
          class="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-80 disabled:opacity-40"
          style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);"
        >▶ {{ running ? 'Starting...' : 'Run' }}</button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Cases -->
      <div class="lg:col-span-2 space-y-4">
        <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:rgba(255,255,255,0.35)">Test Cases ({{ scenario.cases.length }})</h2>
        <div v-for="(c, i) in scenario.cases" :key="i"
             class="rounded-2xl p-5"
             style="background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.09);">
          <div class="mb-3 flex items-center gap-2">
            <span class="rounded-lg px-2.5 py-1 text-xs font-semibold"
                  style="background:rgba(255,255,255,0.10);color:rgba(255,255,255,0.50);">Case {{ i + 1 }}</span>
            <span class="truncate font-mono text-xs" style="color:rgba(255,255,255,0.30)">{{ c.start_url }}</span>
          </div>
          <p class="text-sm text-white/75">{{ c.user_story }}</p>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="rounded-2xl p-5" style="background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.09);">
          <h2 class="mb-4 text-xs font-semibold uppercase tracking-widest" style="color:rgba(255,255,255,0.35)">Variables</h2>
          <p v-if="scenario.context.variables.length === 0" class="text-xs" style="color:rgba(255,255,255,0.30)">No variables</p>
          <div v-else class="space-y-2">
            <div v-for="v in scenario.context.variables" :key="v.name"
                 class="flex items-center justify-between rounded-xl px-3 py-2"
                 style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.07);">
              <span class="font-mono text-xs" style="color:rgba(255,255,255,0.60)">{{ v.name }}</span>
              <span class="text-xs" style="color:rgba(255,255,255,0.35)">{{ v.is_secret ? '••••' : v.value }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl p-5" style="background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.09);">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:rgba(255,255,255,0.35)">Recent Runs</h2>
            <RouterLink to="/runs" class="text-xs" style="color:rgba(255,255,255,0.40)">All →</RouterLink>
          </div>
          <p v-if="recentRuns.length === 0" class="text-xs" style="color:rgba(255,255,255,0.30)">No runs yet</p>
          <div v-else class="space-y-2">
            <RouterLink v-for="r in recentRuns" :key="r.id" :to="`/runs/${r.id}`"
              class="flex items-center justify-between rounded-xl px-3 py-2 transition-all"
              style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);"
              onmouseenter="this.style.background='rgba(255,255,255,0.08)'"
              onmouseleave="this.style.background='rgba(255,255,255,0.04)'"
            >
              <span class="text-xs" style="color:rgba(255,255,255,0.40)">{{ new Date(r.createdAt).toLocaleString() }}</span>
              <span class="rounded-lg px-2 py-0.5 text-xs font-semibold" :style="statusStyle(r.status)">{{ r.status }}</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/lib/api';
import type { Scenario, TestRun } from '@/lib/types';

const route = useRoute();
const id = route.params.id as string;

const scenario = ref<Scenario | null>(null);
const recentRuns = ref<TestRun[]>([]);
const loading = ref(true);
const running = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    const [s, allRuns] = await Promise.all([api.scenarios.get(id), api.runs.list()]);
    scenario.value = s;
    recentRuns.value = allRuns.filter(r => r.scenarioId === id).slice(0, 5);
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

async function run() {
  running.value = true;
  try {
    const { runId } = await api.scenarios.run(id);
    location.href = `/runs/${runId}`;
  } catch (e: any) {
    alert(`Failed to start: ${e.message}`);
    running.value = false;
  }
}

async function del() {
  if (!scenario.value || !confirm(`Delete "${scenario.value.name}"?`)) return;
  await api.scenarios.delete(id);
  location.href = '/';
}

function statusStyle(status: string) {
  if (status === 'running') return 'background:rgba(59,130,246,0.2);color:#93c5fd;';
  if (status === 'completed') return 'background:rgba(34,197,94,0.18);color:#86efac;';
  if (status === 'failed') return 'background:rgba(239,68,68,0.18);color:#fca5a5;';
  return 'background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);';
}
</script>
