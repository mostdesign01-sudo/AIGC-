import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/Home.vue') },
    { path: '/days', name: 'days', component: () => import('./views/DayArchive.vue') },
    { path: '/day/:date(\\d{4}-\\d{2}-\\d{2})', name: 'day', component: () => import('./views/DayPage.vue'), props: true },
    { path: '/weeks', name: 'weeks', component: () => import('./views/WeekArchive.vue') },
    { path: '/week/:weekId(\\d{4}-W\\d{2})', name: 'week', component: () => import('./views/WeekPage.vue'), props: true },
    { path: '/video/:id', name: 'video', component: () => import('./views/VideoPage.vue'), props: true },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./views/NotFound.vue') },
  ],
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 }
  },
})

export default router
