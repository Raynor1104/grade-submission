<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import { useQuery } from '@tanstack/vue-query'

import { courseQueries } from '@/features/courses/api/course.queries'
import { studentQueries } from '@/features/students/api/student.queries'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'
import Pagination from '@/shared/ui/Pagination.vue'

import { gradeQueries } from '../api/grade.queries'
import GradeTable from '../components/GradeTable.vue'
import GradeToolbar from '../components/GradeToolbar.vue'

import type {
  GradeCourse,
  GradeStudent,
  GradeViewModel,
} from '../model/grade.types'

const {
  data: gradeData,
  isPending: gradesPending,
  isError: gradesError,
  refetch: refetchGrades,
} = useQuery(gradeQueries.all())

const {
  data: studentData,
  isPending: studentsPending,
  isError: studentsError,
  refetch: refetchStudents,
} = useQuery(studentQueries.all())

const {
  data: courseData,
  isPending: coursesPending,
  isError: coursesError,
  refetch: refetchCourses,
} = useQuery(courseQueries.all())

const grades = computed(() => gradeData.value ?? [])
const selectedStudentId = ref<number | null>(null)
const selectedCourseId = ref<number | null>(null)
const appliedStudentId = ref<number | null>(null)
const appliedCourseId = ref<number | null>(null)
const page = ref(1)

const pageSize = 6

const students = computed<GradeStudent[]>(() => {
  return studentData.value?.map(student => ({
    id: student.id,
    name: student.name,
  })) ?? []
})

const courses = computed<GradeCourse[]>(() => {
  return courseData.value?.map(course => ({
    id: course.id,
    code: course.code,
    subject: course.subject,
    description: course.description,
  })) ?? []
})

const filteredGrades = computed(() => {
  return grades.value.filter(grade => {
    const matchesStudent =
      appliedStudentId.value === null ||
      grade.student.id === appliedStudentId.value

    const matchesCourse =
      appliedCourseId.value === null ||
      grade.course.id === appliedCourseId.value

    return matchesStudent && matchesCourse
  })
})

const dataPending = computed(() => (
  gradesPending.value || studentsPending.value || coursesPending.value
))

const dataError = computed(() => (
  gradesError.value || studentsError.value || coursesError.value
))

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredGrades.value.length / pageSize))
})

const paginatedGrades = computed(() => {
  const start = (page.value - 1) * pageSize

  return filteredGrades.value.slice(start, start + pageSize)
})

watch(
  [totalPages, dataPending, dataError],
  () => {
    if (!dataPending.value && !dataError.value) {
      page.value = Math.min(page.value, totalPages.value)
    }
  },
)

function retryData(): void {
  if (gradesError.value) void refetchGrades()
  if (studentsError.value) void refetchStudents()
  if (coursesError.value) void refetchCourses()
}

function handleSearch() {
  appliedStudentId.value = selectedStudentId.value
  appliedCourseId.value = selectedCourseId.value
  page.value = 1
}

function handleCreate() {
  console.log('Submit new grade')
}

function handleEdit(grade: GradeViewModel) {
  console.log('Edit grade:', grade)
}
</script>

<template>
  <section>
    <PageHeader
      title="Grade Management"
      subtitle="List"
    />

    <BaseCard>
      <GradeToolbar
        v-model:student-id="selectedStudentId"
        v-model:course-id="selectedCourseId"
        :students="students"
        :courses="courses"
        @search="handleSearch"
        @create="handleCreate"
      />

      <div
        v-if="dataError"
        class="grade-state grade-state--stacked"
        role="alert"
      >
        <span>Unable to load grade data. Please try again.</span>
        <BaseButton
          variant="secondary"
          size="sm"
          @click="retryData"
        >
          Retry
        </BaseButton>
      </div>

      <div
        v-else-if="dataPending"
        class="grade-state"
        role="status"
        aria-live="polite"
      >
        Loading grade data...
      </div>

      <div
        v-else-if="grades.length === 0"
        class="grade-state"
      >
        No grades yet.
      </div>

      <GradeTable
        v-else-if="paginatedGrades.length"
        :grades="paginatedGrades"
        @edit="handleEdit"
      />

      <div
        v-else
        class="grade-state"
      >
        No grades found for the selected filters.
      </div>

      <Pagination
        v-if="filteredGrades.length"
        v-model:page="page"
        :total="filteredGrades.length"
        :page-size="pageSize"
        item-label="grades"
        aria-label="Grade list pagination"
      />
    </BaseCard>
  </section>
</template>

<style scoped lang="scss">
.grade-state {
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  text-align: center;

  &--stacked {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
