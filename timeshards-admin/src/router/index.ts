import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    component: () => import('@/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '控制台', icon: 'Monitor' }
      }
    ]
  },
  {
    path: '/home',
    component: () => import('@/layout/index.vue'),
    redirect: '/home/index',
    children: [
      {
        path: 'index',
        name: 'HomeConfig',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页配置', icon: 'HomeFilled' }
      }
    ]
  },
  {
    path: '/content',
    component: () => import('@/layout/index.vue'),
    redirect: '/content/posts',
    meta: { title: '内容管理', icon: 'Document' },
    children: [
      {
        path: 'posts',
        name: 'Posts',
        component: () => import('@/views/content/posts.vue'),
        meta: { title: '文章管理', icon: 'Notebook' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/content/categories.vue'),
        meta: { title: '分类管理', icon: 'Files' }
      },
      {
        path: 'posts/create',
        name: 'PostCreate',
        component: () => import('@/views/content/post-editor.vue'),
        meta: { title: '新建文章', hidden: true }
      },
      {
        path: 'posts/edit/:id',
        name: 'PostEdit',
        component: () => import('@/views/content/post-editor.vue'),
        meta: { title: '编辑文章', hidden: true }
      },
      {
        path: 'portfolio',
        name: 'Portfolio',
        component: () => import('@/views/content/portfolio.vue'),
        meta: { title: '作品集', icon: 'Suitcase' }
      },
      {
        path: 'resume',
        name: 'Resume',
        component: () => import('@/views/content/resume.vue'),
        meta: { title: '简历管理', icon: 'User' }
      }
    ]
  },
  {
    path: '/interaction',
    component: () => import('@/layout/index.vue'),
    redirect: '/interaction/guestbook',
    meta: { title: '互动管理', icon: 'ChatDotRound' },
    children: [
      {
        path: 'guestbook',
        name: 'Guestbook',
        component: () => import('@/views/interaction/guestbook.vue'),
        meta: { title: '留言板', icon: 'Comment' }
      },
      {
        path: 'chat',
        name: 'Chat',
        component: () => import('@/views/interaction/chat.vue'),
        meta: { title: '聊天室', icon: 'ChatLineRound' }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/layout/index.vue'),
    redirect: '/system/settings',
    meta: { title: '系统设置', icon: 'Setting' },
    children: [
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/system/settings.vue'),
        meta: { title: '基本设置', icon: 'Tools' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/system/profile.vue'),
        meta: { title: '个人信息', icon: 'UserFilled' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 白名单路由（不需要登录）
const whiteList = ['/login']

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  const title = to.meta.title as string
  document.title = title ? `${title} | TimeShards Admin` : 'TimeShards Admin'

  // 检查是否已登录
  const token = localStorage.getItem('token')

  if (token) {
    // 已登录，访问登录页则跳转到首页
    if (to.path === '/login') {
      next('/')
    } else {
      next()
    }
  } else {
    // 未登录，检查是否在白名单
    if (whiteList.includes(to.path)) {
      next()
    } else {
      // 未登录且不在白名单，跳转到登录页
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router
