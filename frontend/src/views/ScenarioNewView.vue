<template>
  <div class="p-8">
    <div class="mb-8">
      <RouterLink to="/" class="text-xs font-medium" style="color:rgba(255,255,255,0.45)">← Back</RouterLink>
      <h1 class="mt-3 text-2xl font-bold text-white">New Scenario</h1>
      <p class="mt-1 text-sm" style="color:rgba(255,255,255,0.40)">Define a new automated test scenario</p>
    </div>
    <div v-if="error" class="mb-6 rounded-xl px-4 py-3 text-sm"
         style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25);color:rgba(252,165,165,1);">{{ error }}</div>
    <ScenarioForm :submitting="submitting" @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { api } from '@/lib/api';
import ScenarioForm from '@/components/ScenarioForm.vue';

const submitting = ref(false);
const error = ref('');

async function handleSubmit(data: any) {
  submitting.value = true;
  error.value = '';
  try {
    await api.scenarios.create(data);
    location.href = '/';
  } catch (e: any) {
    error.value = e.message;
  } finally {
    submitting.value = false;
  }
}
</script>
