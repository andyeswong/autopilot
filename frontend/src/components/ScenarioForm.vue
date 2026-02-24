<template>
  <form @submit.prevent="handleSubmit" class="space-y-8">
    <!-- General -->
    <section class="rounded-2xl p-6 space-y-4" style="background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.09);">
      <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:rgba(255,255,255,0.35)">General</h2>
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-xs font-medium" style="color:rgba(255,255,255,0.55)" for="name">Name *</label>
          <input
            id="name"
            v-model="name"
            required
            placeholder="Login flow"
            class="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 transition-all focus:outline-none"
            style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.10);focus:ring:0"
            onfocus="this.style.borderColor='rgba(124,58,237,0.60)'"
            onblur="this.style.borderColor='rgba(255,255,255,0.10)'"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-xs font-medium" style="color:rgba(255,255,255,0.55)" for="desc">Description</label>
          <textarea
            id="desc"
            v-model="description"
            rows="2"
            placeholder="Optional description..."
            class="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 transition-all focus:outline-none resize-none"
            style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.10);"
            onfocus="this.style.borderColor='rgba(124,58,237,0.60)'"
            onblur="this.style.borderColor='rgba(255,255,255,0.10)'"
          />
        </div>
      </div>
    </section>

    <!-- Variables -->
    <section class="rounded-2xl p-6 space-y-4" style="background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.09);">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:rgba(255,255,255,0.35)">Variables</h2>
        <button type="button" @click="addVariable"
                class="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
          + Add variable
        </button>
      </div>

      <p v-if="variables.length === 0" class="text-xs" style="color:rgba(255,255,255,0.30)">
        No variables. Use variables to inject values like credentials or URLs into your test cases.
      </p>

      <div v-else class="overflow-hidden rounded-xl" style="border:1px solid rgba(255,255,255,0.09);">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-xs font-medium" style="border-bottom:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.35);">
              <th class="px-4 py-2.5 text-left">Name</th>
              <th class="px-4 py-2.5 text-left">Value</th>
              <th class="px-4 py-2.5 text-center">Secret</th>
              <th class="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(v, i) in variables" :key="i" style="border-bottom:1px solid rgba(255,255,255,0.05);" class="last:border-0">
              <td class="px-4 py-2">
                <input
                  v-model="v.name"
                  placeholder="login_url"
                  class="w-full rounded-lg px-2 py-1 font-mono text-xs text-white placeholder-white/20 bg-transparent focus:outline-none"
                  style="border:1px solid transparent;"
                  onfocus="this.style.borderColor='rgba(124,58,237,0.50)';this.style.background='rgba(255,255,255,0.06)'"
                  onblur="this.style.borderColor='transparent';this.style.background='transparent'"
                />
              </td>
              <td class="px-4 py-2">
                <input
                  v-model="v.value"
                  :type="v.is_secret ? 'password' : 'text'"
                  placeholder="value..."
                  class="w-full rounded-lg px-2 py-1 text-xs text-white placeholder-white/20 bg-transparent focus:outline-none"
                  style="border:1px solid transparent;"
                  onfocus="this.style.borderColor='rgba(124,58,237,0.50)';this.style.background='rgba(255,255,255,0.06)'"
                  onblur="this.style.borderColor='transparent';this.style.background='transparent'"
                />
              </td>
              <td class="px-4 py-2 text-center">
                <input type="checkbox" v-model="v.is_secret" class="cursor-pointer accent-violet-500" />
              </td>
              <td class="px-4 py-2 text-right">
                <button type="button" @click="removeVariable(i)" class="text-xs text-red-400/60 hover:text-red-400 transition-colors">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Test Cases -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-semibold uppercase tracking-widest" style="color:rgba(255,255,255,0.35)">
          Test Cases
          <span class="ml-2 rounded-full px-2 py-0.5 text-xs font-normal"
                style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.45);">{{ cases.length }}</span>
        </h2>
        <button type="button" @click="addCase" class="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
          + Add case
        </button>
      </div>

      <div class="space-y-4">
        <div v-for="(c, i) in cases" :key="i"
             class="rounded-2xl p-5"
             style="background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.09);">
          <div class="mb-4 flex items-center justify-between">
            <span class="rounded-lg px-2.5 py-1 text-xs font-semibold"
                  style="background:rgba(255,255,255,0.10);color:rgba(255,255,255,0.50);">Case {{ i + 1 }}</span>
            <button v-if="cases.length > 1" type="button" @click="removeCase(i)"
                    class="text-xs text-red-400/60 hover:text-red-400 transition-colors">Remove</button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="mb-1.5 block text-xs font-medium" style="color:rgba(255,255,255,0.40)">Start URL *</label>
              <input
                v-model="c.start_url"
                required
                placeholder="{{login_url}} or https://example.com"
                class="w-full rounded-xl px-4 py-2.5 font-mono text-sm text-white placeholder-white/25 focus:outline-none transition-all"
                style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.10);"
                onfocus="this.style.borderColor='rgba(124,58,237,0.60)'"
                onblur="this.style.borderColor='rgba(255,255,255,0.10)'"
              />
            </div>
            <div>
              <div class="mb-1.5 flex items-center justify-between">
                <label class="text-xs font-medium" style="color:rgba(255,255,255,0.40)">User Story *</label>
                <div v-if="varNames.length > 0" class="flex items-center gap-1.5 flex-wrap">
                  <span class="text-xs" style="color:rgba(255,255,255,0.25)">Insert:</span>
                  <button
                    v-for="vn in varNames"
                    :key="vn"
                    type="button"
                    @click="insertVar(i, vn)"
                    class="rounded-lg px-2 py-0.5 font-mono text-xs transition-colors"
                    style="background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.60);border:1px solid rgba(255,255,255,0.12);"
                    v-text="'{{' + vn + '}}'"></button>
                </div>
              </div>
              <textarea
                v-model="c.user_story"
                required
                rows="3"
                placeholder="As a user logged in with {{email}} and {{password}}, I can navigate to..."
                class="w-full rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none resize-none transition-all"
                style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.10);"
                onfocus="this.style.borderColor='rgba(124,58,237,0.60)'"
                onblur="this.style.borderColor='rgba(255,255,255,0.10)'"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Actions -->
    <div class="flex items-center gap-4 pt-2">
      <button
        type="submit"
        :disabled="submitting"
        class="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-80 disabled:opacity-40"
        style="background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.15);"
      >
        {{ submitting ? 'Saving...' : 'Save Scenario' }}
      </button>
      <RouterLink to="/" class="text-sm font-medium transition-colors" style="color:rgba(255,255,255,0.40);" onmouseover="this.style.color='rgba(255,255,255,0.70)'" onmouseout="this.style.color='rgba(255,255,255,0.40)'">Cancel</RouterLink>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Scenario, Variable, TestCase } from '@/lib/types';

const props = defineProps<{
  initial?: Partial<Scenario>;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  submit: [data: { name: string; description: string; context: { variables: Variable[] }; cases: TestCase[] }];
}>();

const name = ref(props.initial?.name ?? '');
const description = ref(props.initial?.description ?? '');
const variables = ref<Variable[]>(props.initial?.context?.variables?.map(v => ({ ...v })) ?? []);
const cases = ref<TestCase[]>(props.initial?.cases?.map(c => ({ ...c })) ?? [{ start_url: '', user_story: '' }]);

const varNames = computed(() => variables.value.map(v => v.name).filter(Boolean));

function addVariable() {
  variables.value.push({ name: '', value: '', is_secret: false });
}
function removeVariable(i: number) {
  variables.value.splice(i, 1);
}
function addCase() {
  cases.value.push({ start_url: '', user_story: '' });
}
function removeCase(i: number) {
  cases.value.splice(i, 1);
}
function insertVar(caseIdx: number, varName: string) {
  cases.value[caseIdx].user_story += `{{${varName}}}`;
}

function handleSubmit() {
  emit('submit', {
    name: name.value,
    description: description.value,
    context: { variables: variables.value },
    cases: cases.value
  });
}
</script>
