<script setup lang="ts">
import { computed } from 'vue'
import {
  BookOpen,
  ClipboardList,
  Users,
} from '@lucide/vue'
import { useQuery } from '@tanstack/vue-query'

import { courseQueries } from '@/features/courses/api/course.queries'
import { gradeQueries } from '@/features/grades/api/grade.queries'
import { studentQueries } from '@/features/students/api/student.queries'
import PageHeader from '@/shared/ui/PageHeader.vue'

import DashboardGradeRecords from '../components/DashboardGradeRecords.vue'
import DashboardQuickActions from '../components/DashboardQuickActions.vue'
import DashboardSummaryCard from '../components/DashboardSummaryCard.vue'
import DataAttentionCard from '../components/DataAttentionCard.vue'
import GradesByCourseCard from '../components/GradesByCourseCard.vue'
import {
  getCourseGradeCounts,
  getCoursesWithoutGrades,
  getGradePreview,
  getStudentsWithoutGrades,
} from '../model/dashboard.derived'
import type { DashboardDataSource } from '../model/dashboard.types'

const {
  data: students,
  isPending: studentsPending,
  isError: studentsError,
  refetch: refetchStudents,
} = useQuery(studentQueries.all())

const {
  data: courses,
  isPending: coursesPending,
  isError: coursesError,
  refetch: refetchCourses,
} = useQuery(courseQueries.all())

const {
  data: grades,
  isPending: gradesPending,
  isError: gradesError,
  refetch: refetchGrades,
} = useQuery(gradeQueries.all())

const courseGradeErrors = computed<DashboardDataSource[]>(() => {
  const sources: DashboardDataSource[] = []

  if (coursesError.value) sources.push('courses')
  if (gradesError.value) sources.push('grades')

  return sources
})

const studentAttentionErrors = computed<DashboardDataSource[]>(() => {
  const sources: DashboardDataSource[] = []

  if (studentsError.value) sources.push('students')
  if (gradesError.value) sources.push('grades')

  return sources
})

const courseAttentionErrors = computed<DashboardDataSource[]>(() => {
  const sources: DashboardDataSource[] = []

  if (coursesError.value) sources.push('courses')
  if (gradesError.value) sources.push('grades')

  return sources
})

const courseGradeLoading = computed(() => (
  courseGradeErrors.value.length === 0 &&
  (coursesPending.value || gradesPending.value)
))

const studentAttentionLoading = computed(() => (
  studentAttentionErrors.value.length === 0 &&
  (studentsPending.value || gradesPending.value)
))

const courseAttentionLoading = computed(() => (
  courseAttentionErrors.value.length === 0 &&
  (coursesPending.value || gradesPending.value)
))

const courseGradeRows = computed(() => {
  if (!courses.value || !grades.value) return []

  return getCourseGradeCounts(courses.value, grades.value)
})

const studentsWithoutGrades = computed(() => {
  if (!students.value || !grades.value) return null

  return getStudentsWithoutGrades(students.value, grades.value)
})

const coursesWithoutGrades = computed(() => {
  if (!courses.value || !grades.value) return null

  return getCoursesWithoutGrades(courses.value, grades.value)
})

const gradePreview = computed(() => (
  grades.value ? getGradePreview(grades.value) : []
))

function retrySource(source: DashboardDataSource): void {
  if (source === 'students') {
    void refetchStudents()
    return
  }

  if (source === 'courses') {
    void refetchCourses()
    return
  }

  void refetchGrades()
}
</script>

<template>
  <section class="dashboard-page">
    <PageHeader title="Dashboard" />

    <div class="dashboard-page__summary">
      <DashboardSummaryCard
        label="Total Students"
        :count="students?.length ?? null"
        :is-loading="studentsPending"
        :is-error="studentsError"
        @retry="retrySource('students')"
      >
        <template #icon>
          <Users :size="30" />
        </template>
      </DashboardSummaryCard>

      <DashboardSummaryCard
        label="Total Courses"
        :count="courses?.length ?? null"
        :is-loading="coursesPending"
        :is-error="coursesError"
        @retry="retrySource('courses')"
      >
        <template #icon>
          <BookOpen :size="30" />
        </template>
      </DashboardSummaryCard>

      <DashboardSummaryCard
        label="Total Grades"
        :count="grades?.length ?? null"
        :is-loading="gradesPending"
        :is-error="gradesError"
        @retry="retrySource('grades')"
      >
        <template #icon>
          <ClipboardList :size="30" />
        </template>
      </DashboardSummaryCard>
    </div>

    <DashboardQuickActions />

    <div class="dashboard-page__analytics">
      <GradesByCourseCard
        :rows="courseGradeRows"
        :is-loading="courseGradeLoading"
        :error-sources="courseGradeErrors"
        @retry="retrySource"
      />

      <DataAttentionCard
        :students-without-grades="studentsWithoutGrades"
        :courses-without-grades="coursesWithoutGrades"
        :student-loading="studentAttentionLoading"
        :course-loading="courseAttentionLoading"
        :student-error-sources="studentAttentionErrors"
        :course-error-sources="courseAttentionErrors"
        @retry="retrySource"
      />
    </div>

    <DashboardGradeRecords
      :grades="gradePreview"
      :is-loading="gradesPending"
      :is-error="gradesError"
      @retry="retrySource('grades')"
    />
  </section>
</template>

<style scoped lang="scss">
.dashboard-page {
  display: grid;
  gap: 0.875rem;
}

.dashboard-page :deep(.mb-5) {
  margin-bottom: 0.125rem;
}

.dashboard-page__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.dashboard-page__analytics {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1rem;
}

@media (max-width: 1023px) {
  .dashboard-page__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-page__analytics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 639px) {
  .dashboard-page__summary {
    grid-template-columns: 1fr;
  }
}
</style>
