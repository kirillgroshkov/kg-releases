import HomePage from '@/pages/HomePage.vue'
import { bootstrapService } from '@/srv/bootstrap.service'
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export const router = new Router({
  routes: [
    {
      path: '/',
      component: HomePage,
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  // ensure Bootstrap is finished before rendering any route
  await bootstrapService.init()
  next()
})
