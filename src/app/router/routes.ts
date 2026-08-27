import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () =>
      import('@/app/layouts/MainLayout.vue'),

    children: [
      {
        path: '',
        redirect: '/dashboard',
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