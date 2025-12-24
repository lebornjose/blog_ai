import { createRouter, createWebHistory } from 'vue-router'
import { message } from 'ant-design-vue'

// 导入布局组件
import Layout from '@/components/layout/Layout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '仪表盘', icon: 'DashboardOutlined' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/UserList.vue'),
        meta: { title: '用户管理', icon: 'UserOutlined' }
      },
      {
        path: 'articles',
        name: 'Articles',
        component: () => import('@/views/articles/ArticleList.vue'),
        meta: { title: '文章管理', icon: 'FileTextOutlined' }
      },
      {
        path: 'articles/create',
        name: 'ArticleCreate',
        component: () => import('@/views/articles/ArticleEdit.vue'),
        meta: { title: '创建文章', hidden: true }
      },
      {
        path: 'articles/edit/:id',
        name: 'ArticleEdit',
        component: () => import('@/views/articles/ArticleEdit.vue'),
        meta: { title: '编辑文章', hidden: true }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('@/views/categories/CategoryList.vue'),
        meta: { title: '分类管理', icon: 'TagsOutlined' }
      },
      {
        path: 'comments',
        name: 'Comments',
        component: () => import('@/views/comments/CommentList.vue'),
        meta: { title: '评论管理', icon: 'CommentOutlined' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 博客管理后台` : '博客管理后台'

  if (requiresAuth && !token) {
    // 需要认证但未登录，跳转到登录页
    message.warning('请先登录')
    next('/login')
  } else if (to.path === '/login' && token) {
    // 已登录但访问登录页，跳转到首页
    next('/dashboard')
  } else {
    next()
  }
})

export default router


