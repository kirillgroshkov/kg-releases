import type { NavigationGuard } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { bootstrapDone } from '#src/bootstrapDone.js'
import { analyticsService } from '#src/srv/analytics.service.js'
import { useStore } from '#src/store.js'

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
      path: '/github-callback',
      component: () => import('./pages/GithubCallbackPage.vue'),
      beforeEnter: loggedInGuard,
    },
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
  // Query of /github-callback has OAuth `code` and `state`, which shouldn't go to analytics
  analyticsService.pageView(to.path === '/github-callback' ? to.path : to.fullPath)
})
