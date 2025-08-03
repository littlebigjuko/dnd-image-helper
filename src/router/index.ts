import { createRouter, createWebHistory } from 'vue-router';
import ImageSplitter from '../views/ImageSplitter.vue';
import StandeeCreator from '../views/StandeeCreator.vue';

const routes = [
  {
    path: '/',
    redirect: '/image-splitter'
  },
  {
    path: '/image-splitter',
    name: 'image-splitter',
    component: ImageSplitter
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
