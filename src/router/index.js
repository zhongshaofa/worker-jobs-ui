import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页看板', icon: 'dashboard' }
    }]
  },

  {
    path: '/application',
    component: Layout,
    redirect: '/application/index',
    children: [{
      path: 'applicationList',
      name: '应用管理',
      component: () => import('@/views/application/index'),
      meta: { title: '应用管理', icon: 'el-icon-s-order' }
    }]
  },

  {
    path: '/task',
    component: Layout,
    redirect: '/task/index',
    hidden: true,
    children: [{
      path: 'taskList',
      name: '任务管理',
      component: () => import('@/views/task/index'),
      meta: { title: '应用管理 / 任务管理', icon: 'nested' }
    }]
  },

  {
    path: '/scheduler',
    component: Layout,
    redirect: '/scheduler/index',
    hidden: true,
    children: [{
      path: 'schedulerList',
      name: '任务管理',
      component: () => import('@/views/scheduler/index'),
      meta: { title: '应用管理 / 任务管理 / 调度列表', icon: 'nested' }
    }]
  },

  {
    path: '/schedulerLog',
    component: Layout,
    redirect: '/schedulerLog/index',
    hidden: true,
    children: [{
      path: 'schedulerLogList',
      name: '日志列表',
      component: () => import('@/views/scheduler_log/index'),
      meta: { title: '应用管理 / 任务管理 / 调度列表 / 日志列表', icon: 'nested' }
    }]
  },

  {
    path: '/client',
    component: Layout,
    redirect: '/client/index',
    children: [{
      path: 'clientList',
      name: 'client管理',
      component: () => import('@/views/client/index'),
      meta: { title: 'client管理', icon: 'el-icon-s-platform\n' }
    }]
  },

  {
    path: '/user',
    component: Layout,
    redirect: '/user/index',
    children: [{
      path: 'userList',
      name: '用户管理',
      component: () => import('@/views/user/index'),
      meta: { title: '用户管理', icon: 'el-icon-user-solid' }
    }]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
