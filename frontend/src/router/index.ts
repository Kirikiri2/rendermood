import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import QuizPage from '@/pages/QuizPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',

      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/quizes',
      component: QuizPage,
    },
  ],
})

export default router
