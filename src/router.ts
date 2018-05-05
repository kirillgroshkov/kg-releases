import HomePage from '@/pages/HomePage.vue'
import ProjectPage from '@/pages/ProjectPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'
import ReleasesPage from '@/pages/ReleasesPage.vue'
import { bootstrapService } from '@/srv/bootstrap.service'
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/releases',
      component: ReleasesPage,
    },
    {
      path: '/projects',
      component: ProjectsPage,
    },
    {
      path: '/projects/:ownerName/:projectName',
      component: ProjectPage,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // ensure Bootstrap is finished before rendering any route
  await bootstrapService.init()
  next()
})
