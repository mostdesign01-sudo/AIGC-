import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', meta: { title: '' }, component: () => import('./views/Home.vue') },
    { path: '/days', name: 'days', meta: { title: '每日归档' }, component: () => import('./views/DayArchive.vue') },
    { path: '/day/:date(\\d{4}-\\d{2}-\\d{2})', name: 'day', component: () => import('./views/DayPage.vue'), props: true },
    { path: '/weeks', name: 'weeks', meta: { title: '周榜 TOP3' }, component: () => import('./views/WeekArchive.vue') },
    { path: '/week/:weekId(\\d{4}-W\\d{2})', name: 'week', component: () => import('./views/WeekPage.vue'), props: true },
    { path: '/video/:id', name: 'video', component: () => import('./views/VideoPage.vue'), props: true },
    { path: '/:pathMatch(.*)*', name: 'not-found', meta: { title: '页面不存在' }, component: () => import('./views/NotFound.vue') },
  ],
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 }
  },
})

export const SITE_NAME = 'AIGC创意'

router.afterEach((to) => {
  let sub = (to.meta.title as string | undefined) ?? ''
  if (to.name === 'day') sub = `${to.params.date} 日更`
  else if (to.name === 'week') sub = `${to.params.weekId} 周榜`
  // 视频详情页标题由 VideoPage 根据数据自行设置
  if (to.name === 'video') return
  document.title = sub ? `${sub} · ${SITE_NAME}` : `${SITE_NAME} · 每日创意 · 每周 TOP3`
})

export default router
