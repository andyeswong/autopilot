<template>
  <div class="p-8">
    <div class="mb-8">
      <RouterLink :to="`/scenarios/${id}`" class="text-xs font-medium" style="color:rgba(255,255,255,0.45)">← Back</RouterLink>
      <h1 class="mt-3 text-2xl font-bold text-white">Edit Scenario</h1>
      <p class="mt-1 text-sm" style="color:rgba(255,255,255,0.40)">Update scenario settings and test cases</p>
    </div>
    <p v-if="loading" class="text-sm" style="color:rgba(255,255,255,0.40)">Loading...</p>
    <div v-else-if="error" class="mb-6 rounded-xl px-4 py-3 text-sm"
         style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25);color:rgba(252,165,165,1);">{{ error }}</div>
    <ScenarioForm v-else-if="scenario" :initial="scenario" :submitting="submitting" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '@/lib/api';
import ScenarioForm from '@/components/ScenarioForm.vue';
import type { Scenario } from '@/lib/types';

const route = useRoute();
const id = route.params.id as string;

const scenario = ref<Scenario | null>(null);
const loading = ref(true);
const submitting = ref(false);
const error = ref('');

onMounted(async () => {
  try {
    scenario.value = await api.scenarios.get(id);
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

async function handleSubmit(data: any) {
  submitting.value = true;
  try {
    await api.scenarios.update(id, data);
    location.href = '/';
  } catch (e: any) {
    error.value = e.message;
  } finally {
    submitting.value = false;
  }
}
</script>
