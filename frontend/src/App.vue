<template>
  <div class="flex h-screen overflow-hidden text-white">
    <!-- Sidebar -->
    <aside class="relative flex w-56 flex-col shrink-0 py-5"
           style="background:#111927; border-right:1px solid rgba(255,255,255,0.06);">

      <!-- Logo -->
      <div class="px-5 mb-7 flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
             style="background:#4f46e5;">
          <!-- Grid icon -->
          <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
            <rect x="1" y="1" width="6" height="6" rx="1.2"/>
            <rect x="9" y="1" width="6" height="6" rx="1.2"/>
            <rect x="1" y="9" width="6" height="6" rx="1.2"/>
            <rect x="9" y="9" width="6" height="6" rx="1.2"/>
          </svg>
        </div>
        <span class="text-xs font-bold tracking-widest uppercase text-white">Auto Inspector</span>
      </div>

      <!-- Nav -->
      <nav class="flex flex-col gap-0.5 px-2 flex-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.href"
          :to="link.href"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150"
          :class="isActive(link) ? 'text-white' : 'hover:text-white'"
          :style="isActive(link)
            ? 'background:#4f46e5; color:white;'
            : 'color:rgba(255,255,255,0.45);'"
        >
          <!-- icon -->
          <svg width="16" height="16" viewBox="0 0 16 16" class="shrink-0"
               :fill="isActive(link) ? 'white' : 'rgba(255,255,255,0.45)'">
            <path v-if="link.icon === 'scenarios'" d="M1 1h6v6H1zm8 0h6v6H9zM1 9h6v6H1zm8 0h6v6H9z"/>
            <path v-if="link.icon === 'runs'" fill-rule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 3.5a.75.75 0 0 0-1.5 0v4c0 .199.079.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06L8.75 8.19V4.5z"/>
            <path v-if="link.icon === 'sandbox'" d="M5.5 1h5l1 4H4.5l1-4zM3 5.5v.5l3 6h4l3-6V5.5H3z"/>
            <path v-if="link.icon === 'settings'" fill-rule="evenodd" d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM6.5 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z M13.25 7.25h-1.01a4.52 4.52 0 0 0-.42-1.01l.72-.72a.75.75 0 0 0-1.06-1.06l-.72.72a4.52 4.52 0 0 0-1.01-.42V3.75a.75.75 0 0 0-1.5 0v1.01a4.52 4.52 0 0 0-1.01.42l-.72-.72a.75.75 0 0 0-1.06 1.06l.72.72a4.52 4.52 0 0 0-.42 1.01H3.75a.75.75 0 0 0 0 1.5h1.01c.1.358.24.7.42 1.01l-.72.72a.75.75 0 1 0 1.06 1.06l.72-.72c.31.18.652.32 1.01.42v1.01a.75.75 0 0 0 1.5 0v-1.01a4.52 4.52 0 0 0 1.01-.42l.72.72a.75.75 0 1 0 1.06-1.06l-.72-.72c.18-.31.32-.652.42-1.01h1.01a.75.75 0 0 0 0-1.5z"/>
          </svg>
          {{ link.label }}
        </RouterLink>
      </nav>

      <!-- Version -->
      <div class="px-5 mt-4">
        <p class="text-xs" style="color:rgba(255,255,255,0.18);">v0.1.0</p>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

const navLinks = [
  { href: '/', label: 'Scenarios', icon: 'scenarios' },
  { href: '/runs', label: 'Run History', icon: 'runs' },
  { href: '/sandbox', label: 'Sandbox', icon: 'sandbox' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
];

function isActive(link: { href: string }) {
  if (link.href === '/') return route.path === '/';
  return route.path.startsWith(link.href);
}
</script>
