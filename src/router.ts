import type { NavigationGuard } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { bootstrapDone } from '@/bootstrapDone'
import { analyticsService } from '@/srv/analytics.service'
import { useStore } from '@/store'

const loggedInGuard: NavigationGuard = () => {
  const u = useStore().user
  if (u.uid) return true
  console.log('GUARD: loggedInGuard')
  return '/'
}

const guestOnlyGuard: NavigationGuard = () => {
  const u = useStore().user
  if (!u.uid) return true
  console.log('GUARD: guestOnlyGuard')
  return '/releases'
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

router.beforeEach(async () => {
  // ensure Bootstrap is finished before rendering any route
  await bootstrapDone
})

router.afterEach(to => {
  analyticsService.pageView(to.fullPath)
})
