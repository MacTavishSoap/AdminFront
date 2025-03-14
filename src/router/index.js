import storage from '@/utils/storage'
import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: '登录',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/Login.vue'),
    },
    {
      path: '/home',
      name: '主页',
      component: () => import('../views/Home.vue'),
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: () => import('@/views/welcome.vue'),
          meta: { tTitle: '首页' }
        },
        {
          path: '/system/sysAdmin',
          component: () => import('@/views/system/sysAdmin.vue'),
          meta: { sTitle: '系统管理', tTitle: '用户信息' }
        },
        {
          path: '/system/sysRole',
          component: () => import('@/views/system/sysRole.vue'),
          meta: { sTitle: '系统管理', tTitle: '角色信息' }
        },
        {
          path: '/system/sysMenu',
          component: () => import('@/views/system/sysMenu.vue'),
          meta: { sTitle: '系统管理', tTitle: '菜单信息' }
        },
        {
          path: '/question/list',
          component: () => import('@/views/question/QuestionList.vue'),
          meta: { sTitle: '题库管理', tTitle: '题目列表' }
        }, 
        {
          path: '/question/category',
          component: () => import('@/views/question/QuestionCategory.vue'),
          meta: { sTitle: '题库管理', tTitle: '分类管理' }
        }, 
        {
          path: '/app/carousel',
          component: () => import('@/views/app/carousel.vue'),
          meta: { sTitle: '题库管理', tTitle: '题目列表' }
        }
      ]
    },
  ],
})

export default router

const whiteList = ['/login']
router.beforeEach((to, form, next) => {
  let token = storage.getItem("token")
  if (token) {

    NProgress.start()
    if (to.path == '/login') {
      next('/home')
    } else {
      next()
    }

  } else {
    if (whiteList.indexOf(to.path) > -1) {
      next()
    } else {
      next('/login')
    }
  }
})

router.afterEach((to, form, next) => {
  NProgress.done()
})