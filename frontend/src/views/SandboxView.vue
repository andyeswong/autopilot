<template>
  <div class="flex h-full overflow-hidden">
    <!-- ── Left: Chat panel ─────────────────────────────────── -->
    <div class="flex flex-col shrink-0 w-[420px]"
         style="border-right: 1px solid rgba(255,255,255,0.07);">

      <!-- Header -->
      <div class="px-5 py-4 shrink-0"
           style="border-bottom: 1px solid rgba(255,255,255,0.07);">
        <h1 class="text-sm font-semibold text-white">Sandbox</h1>
        <p class="text-xs mt-0.5" style="color:rgba(255,255,255,0.30)">
          Run instant tests with live browser preview
        </p>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-5" ref="messagesEl">
        <!-- Empty state -->
        <div v-if="runs.length === 0"
             class="flex flex-col items-center justify-center h-full gap-2 pb-12">
          <p class="text-sm" style="color:rgba(255,255,255,0.20)">No runs yet</p>
          <p class="text-xs text-center" style="color:rgba(255,255,255,0.14); max-width:200px;">
            Enter a URL and describe what to test below
          </p>
        </div>

        <!-- Run bubbles -->
        <div v-for="run in runs" :key="run.id" class="space-y-2">

          <!-- User prompt bubble -->
          <div class="flex justify-end">
            <div class="max-w-[88%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm"
                 style="background:rgba(255,255,255,0.09);border:1px solid rgba(255,255,255,0.10);">
              <p class="text-xs mb-1.5 font-mono truncate" style="color:rgba(255,255,255,0.35)">
                {{ run.startUrl }}
              </p>
              <p class="text-white/85 leading-relaxed whitespace-pre-wrap">{{ run.prompt }}</p>
            </div>
          </div>

          <!-- Agent response bubble -->
          <div class="flex justify-start">
            <div class="max-w-[92%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm space-y-2.5"
                 style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);">

              <!-- Status row -->
              <div class="flex items-center gap-2">
                <span class="text-xs font-medium" :style="statusColor(run.status)">
                  {{ statusLabel(run.status) }}
                </span>
                <!-- Typing dots while running -->
                <span v-if="run.status === 'running'" class="flex items-center gap-0.5">
                  <span class="inline-block w-1 h-1 rounded-full animate-bounce"
                        style="background:rgba(255,255,255,0.35);animation-delay:0ms"></span>
                  <span class="inline-block w-1 h-1 rounded-full animate-bounce"
                        style="background:rgba(255,255,255,0.35);animation-delay:150ms"></span>
                  <span class="inline-block w-1 h-1 rounded-full animate-bounce"
                        style="background:rgba(255,255,255,0.35);animation-delay:300ms"></span>
                </span>
              </div>

              <!-- Log stream -->
              <div v-if="run.logs.length"
                   class="space-y-1 max-h-52 overflow-y-auto pr-1"
                   :ref="(el) => setLogRef(run.id, el as HTMLElement | null)">
                <div v-for="(log, i) in run.logs" :key="i"
                     class="flex items-start gap-1.5 leading-relaxed" style="font-size:11px;">
                  <span class="shrink-0 mt-px font-mono" :style="logLevelStyle(log.level)">
                    {{ logLevelIcon(log.level) }}
                  </span>
                  <span style="color:rgba(255,255,255,0.55)">{{ log.message }}</span>
                </div>
              </div>

              <!-- Final verdict -->
              <div v-if="run.result"
                   class="pt-2.5"
                   style="border-top:1px solid rgba(255,255,255,0.07);">
                <div class="flex items-start gap-2">
                  <span class="text-xs font-semibold shrink-0"
                        :style="run.result.passed ? 'color:#4ade80' : 'color:#f87171'">
                    {{ run.result.passed ? 'Passed' : 'Failed' }}
                  </span>
                  <p class="text-xs leading-relaxed" style="color:rgba(255,255,255,0.45)">
                    {{ run.result.reason }}
                  </p>
                </div>
              </div>

              <!-- Error -->
              <div v-if="run.error" class="pt-2"
                   style="border-top:1px solid rgba(255,255,255,0.07);">
                <p class="text-xs" style="color:#f87171">{{ run.error }}</p>
              </div>

            </div>
          </div>

        </div>
      </div><!-- /messages -->

      <!-- Input area -->
      <div class="shrink-0 p-4"
           style="border-top: 1px solid rgba(255,255,255,0.07);">
        <div class="rounded-2xl p-3 space-y-2.5"
             style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);">
          <!-- URL row -->
          <div class="flex items-center gap-2">
            <span class="text-xs shrink-0" style="color:rgba(255,255,255,0.30)">URL</span>
            <input
              v-model="inputUrl"
              type="url"
              placeholder="https://example.com"
              class="flex-1 bg-transparent text-xs text-white outline-none placeholder-white/20"
              @keydown.enter.meta.prevent="submit"
              @keydown.enter.ctrl.prevent="submit"
            />
          </div>
          <div style="border-top:1px solid rgba(255,255,255,0.07)"></div>
          <!-- Prompt textarea -->
          <textarea
            v-model="inputPrompt"
            placeholder="Describe the test — e.g. Login with admin/admin and verify the dashboard loads"
            rows="3"
            class="w-full bg-transparent text-xs text-white outline-none resize-none placeholder-white/20 leading-relaxed"
            @keydown.enter.meta.prevent="submit"
            @keydown.enter.ctrl.prevent="submit"
          />
          <!-- Footer row -->
          <div class="flex items-center justify-between pt-0.5">
            <span class="text-xs" style="color:rgba(255,255,255,0.18)">
              {{ isMac ? '⌘' : 'Ctrl' }}+Enter to run
            </span>
            <button
              @click="submit"
              :disabled="isRunning || !inputUrl.trim() || !inputPrompt.trim()"
              class="px-4 py-1.5 rounded-xl text-xs font-medium transition-all disabled:opacity-25 hover:opacity-80"
              style="background:rgba(255,255,255,0.11);border:1px solid rgba(255,255,255,0.11);"
            >
              Run
            </button>
          </div>
        </div>
      </div>

    </div><!-- /left -->

    <!-- ── Right: VNC live preview ──────────────────────────── -->
    <div class="flex-1 flex flex-col" style="background:rgba(0,0,0,0.25);">
      <!-- preview header -->
      <div class="px-5 py-3 shrink-0 flex items-center gap-2.5"
           style="border-bottom:1px solid rgba(255,255,255,0.07);">
        <div class="w-2 h-2 rounded-full transition-colors duration-500"
             :style="isRunning
               ? 'background:#4ade80; box-shadow:0 0 6px #4ade8088'
               : 'background:rgba(255,255,255,0.15)'">
        </div>
        <span class="text-xs font-medium" style="color:rgba(255,255,255,0.40)">
          Live Browser Preview
        </span>
        <span v-if="isRunning" class="text-xs" style="color:rgba(255,255,255,0.20)">
          — test in progress
        </span>
      </div>

      <!-- VNC iframe -->
      <div class="flex-1 relative">
        <iframe
          :src="vncUrl"
          class="absolute inset-0 w-full h-full border-0"
          allow="*"
          title="Live browser preview"
        />
      </div>
    </div><!-- /right -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { api } from '@/lib/api';
import { listenToRun } from '@/lib/socket';
import type { EvtAgentLog } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEntry {
  message: string;
  level: 'loading' | 'success' | 'failure' | 'info';
}

interface SandboxRun {
  id: string;
  startUrl: string;
  prompt: string;
  status: 'running' | 'completed' | 'failed';
  logs: LogEntry[];
  result: { passed: boolean; reason: string } | null;
  error: string | null;
}

// ─── State ───────────────────────────────────────────────────────────────────

const inputUrl = ref('');
const inputPrompt = ref('');
const runs = ref<SandboxRun[]>([]);
const messagesEl = ref<HTMLElement | null>(null);
const logRefs = new Map<string, HTMLElement>();

const isMac = navigator.platform.toUpperCase().includes('MAC');

const vncUrl = computed(() => {
  const base = (import.meta.env.VITE_VNC_URL ?? 'http://localhost:6080') + '/vnc.html';
  return `${base}?autoconnect=1&password=secret&resize=scale`;
});

const isRunning = computed(() => runs.value.some((r) => r.status === 'running'));

// ─── Log refs for per-run auto-scroll ────────────────────────────────────────

function setLogRef(id: string, el: HTMLElement | null) {
  if (el) logRefs.set(id, el);
  else logRefs.delete(id);
}

async function scrollLogsToBottom(runId: string) {
  await nextTick();
  const el = logRefs.get(runId);
  if (el) el.scrollTop = el.scrollHeight;
  // also scroll the messages panel
  if (messagesEl.value) {
    messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
  }
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusLabel(status: SandboxRun['status']) {
  if (status === 'running') return 'Running';
  if (status === 'completed') return 'Completed';
  return 'Failed';
}

function statusColor(status: SandboxRun['status']) {
  if (status === 'running') return 'color:rgba(255,255,255,0.40)';
  if (status === 'completed') return 'color:rgba(255,255,255,0.35)';
  return 'color:#f87171';
}

function logLevelIcon(level: LogEntry['level']) {
  if (level === 'success') return '✓';
  if (level === 'failure') return '✕';
  if (level === 'loading') return '–';
  return '·';
}

function logLevelStyle(level: LogEntry['level']) {
  if (level === 'success') return 'color:#4ade80';
  if (level === 'failure') return 'color:#f87171';
  if (level === 'loading') return 'color:rgba(255,255,255,0.35)';
  return 'color:rgba(255,255,255,0.25)';
}

// ─── Submit ───────────────────────────────────────────────────────────────────

async function submit() {
  const url = inputUrl.value.trim();
  const prompt = inputPrompt.value.trim();
  if (!url || !prompt || isRunning.value) return;

  // Optimistically push a run entry
  const run: SandboxRun = {
    id: '',           // filled in after API call
    startUrl: url,
    prompt,
    status: 'running',
    logs: [],
    result: null,
    error: null,
  };
  runs.value.push(run);
  const runIndex = runs.value.length - 1;

  // Clear inputs
  inputUrl.value = '';
  inputPrompt.value = '';

  await nextTick();
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight;

  try {
    const { runId } = await api.runs.runInline({
      context: { variables: [] },
      cases: [{ start_url: url, user_story: prompt }],
    });

    runs.value[runIndex].id = runId;
    const run = runs.value[runIndex];

    // Subscribe to WebSocket events
    const unsubscribe = listenToRun(runId, {
      onLog(e: EvtAgentLog) {
        run.logs.push({ message: e.message, level: e.level });
        scrollLogsToBottom(runId);
      },
      onCaseCompleted(e) {
        run.result = { passed: e.passed, reason: e.reason };
        scrollLogsToBottom(runId);
      },
      onFinished() {
        run.status = 'completed';
        unsubscribe();
        scrollLogsToBottom(runId);
      },
      onError(e) {
        run.status = 'failed';
        run.error = e.error;
        unsubscribe();
        scrollLogsToBottom(runId);
      },
    });
  } catch (err: any) {
    runs.value[runIndex].status = 'failed';
    runs.value[runIndex].error = err?.message ?? 'Failed to start run';
    await nextTick();
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight;
  }
}
</script>
