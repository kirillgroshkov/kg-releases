import HomePage from '@/pages/HomePage.vue'
import ProjectPage from '@/pages/ProjectPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'
import ReleasesPage from '@/pages/ReleasesPage.vue'
import SettingsPage from '@/pages/SettingsPage.vue'
import { bootstrapService } from '@/srv/bootstrap.service'
import { st, store } from '@/store'
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
      component: HomePage,
      beforeEnter: guestOnlyGuard,
    },
    {
      path: '/releases',
      component: ReleasesPage,
      beforeEnter: loggedInGuard,
    },
    {
      path: '/projects',
      component: ProjectsPage,
      beforeEnter: loggedInGuard,
    },
    {
      path: '/projects/:ownerName/:projectName',
      component: ProjectPage,
      beforeEnter: loggedInGuard,
    },
    {
      path: '/settings',
      component: SettingsPage,
      beforeEnter: loggedInGuard,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // ensure Bootstrap is finished before rendering any route
  await bootstrapService.init()
  next()
})
