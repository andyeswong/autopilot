<template>
  <div class="p-8">
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Run History</h1>
        <p class="mt-1 text-sm" style="color:rgba(255,255,255,0.40)">All past and active test runs</p>
      </div>
      <span v-if="!loading && runs.length > 0"
            class="rounded-xl px-3 py-1 text-xs font-medium"
            style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.50);border:1px solid rgba(255,255,255,0.10);">
        {{ runs.length }} run{{ runs.length === 1 ? '' : 's' }}
      </span>
    </div>

    <p v-if="loading" class="text-sm" style="color:rgba(255,255,255,0.40)">Loading...</p>
    <p v-else-if="error" class="text-sm text-red-400">{{ error }}</p>

    <div v-else-if="runs.length === 0"
         class="rounded-xl p-16 text-center"
         style="background:#151f30;border:1px dashed rgba(255,255,255,0.12);">
      <p class="text-sm mb-3" style="color:rgba(255,255,255,0.40)">No runs yet. Go to a scenario and click Run.</p>
              <RouterLink to="/" class="mt-3 inline-block text-sm font-medium" style="color:rgba(255,255,255,0.55)">← View Scenarios</RouterLink>
    </div>

    <div v-else class="overflow-hidden rounded-xl" style="background:#151f30;border:1px solid rgba(255,255,255,0.07);">
      <table class="w-full text-sm">
        <thead style="border-bottom:1px solid rgba(255,255,255,0.08);">
          <tr class="text-xs uppercase tracking-wide" style="color:rgba(255,255,255,0.35);">
            <th class="px-5 py-3.5 text-left">Started</th>
            <th class="px-5 py-3.5 text-left">Scenario</th>
            <th class="px-5 py-3.5 text-left">Cases</th>
            <th class="px-5 py-3.5 text-left">Status</th>
            <th class="px-5 py-3.5 text-left">Pass Rate</th>
            <th class="px-5 py-3.5"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in runs" :key="r.id"
              class="transition-colors"
              style="border-bottom:1px solid rgba(255,255,255,0.05);"
              onmouseenter="this.style.background='rgba(255,255,255,0.04)'"
              onmouseleave="this.style.background=''"
          >
            <td class="px-5 py-3.5 text-xs" style="color:rgba(255,255,255,0.45)">{{ new Date(r.createdAt).toLocaleString() }}</td>
            <td class="px-5 py-3.5 font-medium text-white/80">{{ r.scenario?.name ?? r.scenarioId ?? '—' }}</td>
            <td class="px-5 py-3.5 text-xs" style="color:rgba(255,255,255,0.45)">{{ r.snapshotCases.length }}</td>
            <td class="px-5 py-3.5">
              <span class="rounded-lg px-2.5 py-1 text-xs font-semibold" :style="statusStyle(r.status)">{{ r.status }}</span>
            </td>
            <td class="px-5 py-3.5 text-xs" style="color:rgba(255,255,255,0.45)">{{ passRate(r) }}</td>
            <td class="px-5 py-3.5 text-right">
              <RouterLink :to="`/runs/${r.id}`" class="mr-4 text-xs font-medium" style="color:rgba(255,255,255,0.60)">View</RouterLink>
              <button @click="del(r.id)" class="text-xs font-medium text-red-400/60 hover:text-red-400">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api } from '@/lib/api';
import type { TestRun } from '@/lib/types';

const runs = ref<TestRun[]>([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    runs.value = await api.runs.list();
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

async function del(id: string) {
  if (!confirm('Delete this run?')) return;
  await api.runs.delete(id);
  runs.value = runs.value.filter(r => r.id !== id);
}

function passRate(run: TestRun) {
  if (!run.results || run.results.length === 0) return '—';
  const passed = run.results.filter(r => r.passed).length;
  return `${passed}/${run.snapshotCases.length}`;
}

function statusStyle(status: string) {
  if (status === 'running') return 'background:rgba(59,130,246,0.2);color:#93c5fd;';
  if (status === 'completed') return 'background:rgba(34,197,94,0.18);color:#86efac;';
  if (status === 'failed') return 'background:rgba(239,68,68,0.18);color:#fca5a5;';
  return 'background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);';
}
</script>
