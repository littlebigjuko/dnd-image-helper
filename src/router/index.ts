import { createRouter, createWebHistory } from 'vue-router';
import ImageSplitter from '../views/ImageSplitter.vue';
import TokenCreator from '../views/TokenCreator.vue';

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
    path: '/token-creator',
    name: 'token-creator',
    component: TokenCreator
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
