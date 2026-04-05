import { createRouter, createWebHistory } from 'vue-router'

import QuizPage from '@/pages/QuizPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: QuizPage,
    },
  ],
})

export default router
