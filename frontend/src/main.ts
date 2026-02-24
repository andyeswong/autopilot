import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './assets/main.css';

import ScenariosView from './views/ScenariosView.vue';
import ScenarioNewView from './views/ScenarioNewView.vue';
import ScenarioDetailView from './views/ScenarioDetailView.vue';
import ScenarioEditView from './views/ScenarioEditView.vue';
import RunsView from './views/RunsView.vue';
import RunDetailView from './views/RunDetailView.vue';
import SandboxView from './views/SandboxView.vue';
import SettingsView from './views/SettingsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: ScenariosView },
    { path: '/scenarios/new', component: ScenarioNewView },
    { path: '/scenarios/:id', component: ScenarioDetailView },
    { path: '/scenarios/:id/edit', component: ScenarioEditView },
    { path: '/runs', component: RunsView },
    { path: '/runs/:id', component: RunDetailView },
    { path: '/sandbox', component: SandboxView },
    { path: '/settings', component: SettingsView }
  ]
});

createApp(App).use(router).mount('#app');
