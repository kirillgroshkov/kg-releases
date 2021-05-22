import { bootstrapDone } from '@/bootstrapDone'
import { analyticsService } from '@/srv/analytics.service'
import { st } from '@/store'
import Vue from 'vue'
import Router from 'vue-router'
import { NavigationGuard } from 'vue-router/types/router'

Vue.use(Router)

const loggedInGuard: NavigationGuard = (to, from, next) => {
  const u = st().user
  if (u.uid) return next()
  console.log('GUARD: loggedInGuard')
  next('/')
}

const guestOnlyGuard: NavigationGuard = (to, from, next) => {
  const u = st().user
  if (!u.uid) return next()
  console.log('GUARD: guestOnlyGuard')
  next('/releases')
}

export const router = new Router({
  mode: 'history',
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
    {
      path: '/projects',
      component: () => import('./pages/ProjectsPage.vue'),
      beforeEnter: loggedInGuard,
    },
    {
      path: '/projects/:ownerName/:projectName',
      component: () => import('./pages/ProjectPage.vue'),
      beforeEnter: loggedInGuard,
    },
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

  analyticsService.pageView(to.path)

  next()
})
