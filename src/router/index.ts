import { createRouter, createWebHistory } from 'vue-router';
import MapSplit from '../views/MapSplit.vue';
import StandeeCreator from '../views/StandeeCreator.vue';

const routes = [
  {
    path: '/',
    redirect: '/map-split'
  },
  {
    path: '/map-split',
    name: 'map-split',
    component: MapSplit
  },
  {
    path: '/standee-creator',
    name: 'standee-creator',
    component: StandeeCreator
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
