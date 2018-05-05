import ReleasesPage from '@/pages/ReleasesPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'
import { bootstrapService } from '@/srv/bootstrap.service'
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const router = new Router({
  routes: [
    {
      path: '/',
      component: ReleasesPage,
    },
    {
      path: '/projects',
      component: ProjectsPage,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // ensure Bootstrap is finished before rendering any route
  // await bootstrapService.init()
  next()
})
