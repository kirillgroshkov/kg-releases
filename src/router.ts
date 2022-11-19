import { createRouter, createWebHistory, NavigationGuard } from 'vue-router'
import { useStore } from '@/store'
import { bootstrapDone } from '@/bootstrapDone'
import { analyticsService } from '@/srv/analytics.service'

const loggedInGuard: NavigationGuard = (to, from, next) => {
  const u = useStore().user
  if (u.uid) return next()
  console.log('GUARD: loggedInGuard')
  next('/')
}

const guestOnlyGuard: NavigationGuard = (to, from, next) => {
  const u = useStore().user
  if (!u.uid) return next()
  console.log('GUARD: guestOnlyGuard')
  next('/releases')
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('./pages/HomePage.vue'),
      beforeEnter: guestOnlyGuard,
    },
    {
      path: '/releases',
      component: () => import('./pages/ReleasesPage.vue'),
      beforeEnter: loggedInGuard,
    },
    // {
    //   path: '/projects',
    //   component: () => import('./pages/ProjectsPage.vue'),
    //   beforeEnter: loggedInGuard,
    // },
    // {
    //   path: '/projects/:ownerName/:projectName',
    //   component: () => import('./pages/ProjectPage.vue'),
    //   beforeEnter: loggedInGuard,
    // },
    {
      path: '/settings',
      component: () => import('./pages/SettingsPage.vue'),
      beforeEnter: loggedInGuard,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // ensure Bootstrap is finished before rendering any route
  await bootstrapDone

  next()
})

router.afterEach(to => {
  analyticsService.pageView(to.fullPath)
})
