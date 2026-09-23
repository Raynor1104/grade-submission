import type { RouteRecordRaw } from 'vue-router'

import { authSession } from '@/core/auth/auth-session'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () =>
      import('@/features/auth/pages/LoginPage.vue'),
  },
  {
    path: '/',
    component: () =>
      import('@/app/layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true,
    },

    children: [
      {
        path: '',
        name: 'home',
        redirect: () => authSession.isAuthenticated
          ? { name: 'dashboard' }
          : { name: 'login' },
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () =>
          import('@/features/dashboard/pages/DashboardPage.vue'),
      },
      {
        path: 'students',
        name: 'students',
        component: () =>
          import('@/features/students/pages/StudentsPage.vue'),
      },
      {
        path: 'students/new',
        name: 'student-create',
        component: () =>
          import('@/features/students/pages/StudentCreatePage.vue'),
      },
      {
        path: 'students/:id/edit',
        name: 'student-edit',
        component: () =>
          import('@/features/students/pages/StudentEditPage.vue'),
      },
      {
        path: 'students/:id',
        name: 'student-detail',
        component: () =>
          import('@/features/students/pages/StudentDetailPage.vue'),
      },
      {
        path: 'courses',
        name: 'courses',
        component: () =>
          import('@/features/courses/pages/CoursesPage.vue'),
      },
      {
        path: 'courses/new',
        name: 'course-create',
        component: () =>
          import('@/features/courses/pages/CourseCreatePage.vue')
      },
      {
        path: 'courses/:id',
        name: 'course-detail',
        component: () =>
          import('@/features/courses/pages/CourseDetailPage.vue')
      },
      {
        path: 'grades',
        name: 'grades',
        component: () =>
          import('@/features/grades/pages/GradesPage.vue'),
      },
    ],
  },
]
