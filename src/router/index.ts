import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from '../views/LoginPage.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/DashboardPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/competitor',
      name: 'Competitor',
      component: () => import('../views/CompetitorPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/dynamic',
      name: 'Dynamic',
      component: () => import('../views/DynamicPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/report',
      name: 'Report',
      component: () => import('../views/ReportPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('../views/HistoryPage.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/setting',
      name: 'Setting',
      component: () => import('../views/SettingPage.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token');
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
