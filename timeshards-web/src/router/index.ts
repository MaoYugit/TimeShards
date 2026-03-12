import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // 用户端页面
  {
    path: '/',
    name: 'home',
    component: () => import('../views/front/HomeView.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/portfolio',
    name: 'portfolio',
    component: () => import('../views/front/PortfolioView.vue'),
    meta: { title: '作品集' },
  },
  {
    path: '/blog',
    name: 'blog-list',
    component: () => import('../views/front/BlogView.vue'),
    meta: { title: '博客列表' },
  },
  {
    path: '/blog/:id',
    name: 'blog-detail',
    component: () => import('../views/front/BlogDetailView.vue'),
    meta: { title: '博客详情' },
  },
  {
    path: '/guestbook',
    name: 'guestbook',
    component: () => import('../views/front/GuestbookView.vue'),
    meta: { title: '留言板' },
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import('../views/front/ChatView.vue'),
    meta: { title: '聊天室' },
  },
  {
    path: '/resume',
    name: 'resume',
    component: () => import('../views/front/ResumeView.vue'),
    meta: { title: '简历' },
  },

  // 管理后台页面
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/admin/LoginView.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/admin/DashboardView.vue'),
    meta: { title: '数据面板' },
  },
  {
    path: '/post-management',
    name: 'post-management',
    component: () => import('../views/admin/PostManagementView.vue'),
    meta: { title: '博客管理' },
  },

  // 404 页面
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: '404' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,

  // 优雅处理，切换页面后滚动到顶部
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach((to) => {
  const baseTitle = 'TimeShards'
  document.title = to.meta.title ? `${to.meta.title} | ${baseTitle}` : baseTitle
})

export default router
