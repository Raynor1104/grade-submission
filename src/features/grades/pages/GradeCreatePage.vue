<script setup lang="ts">
import {
  computed,
  ref,
} from 'vue'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { ApiRequestError } from '@/core/api/types'
import { courseQueries } from '@/features/courses/api/course.queries'
import { studentQueries } from '@/features/students/api/student.queries'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

import { createGrade } from '../api/grade.api'
import { invalidateGradeDependencies } from '../api/grade.queries'
import GradeForm from '../components/GradeForm.vue'
import type { GradeFormValues } from '../model/grade-form'
import type {
  GradeCourse,
  GradeStudent,
} from '../model/grade.types'

const router = useRouter()
const queryClient = useQueryClient()
const submitError = ref<string | null>(null)
const requestInFlight = ref(false)

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

const students = computed<GradeStudent[]>(() => studentData.value?.map(student => ({
  id: student.id,
  name: student.name,
})) ?? [])

const courses = computed<GradeCourse[]>(() => courseData.value?.map(course => ({
  id: course.id,
  code: course.code,
  subject: course.subject,
  description: course.description,
})) ?? [])

const dependenciesPending = computed(() => studentsPending.value || coursesPending.value)
const dependenciesError = computed(() => studentsError.value || coursesError.value)
const dependenciesEmpty = computed(() => (
  !dependenciesPending.value &&
  !dependenciesError.value &&
  (students.value.length === 0 || courses.value.length === 0)
))
const formBlocked = computed(() => (
  dependenciesPending.value || dependenciesError.value || dependenciesEmpty.value
))

const { isPending: createPending, mutateAsync: mutateGrade } = useMutation({
  mutationFn: (values: GradeFormValues) => createGrade(
    values.studentId as number,
    values.courseId as number,
    { score: values.score },
  ),
  retry: false,
})
const submissionPending = computed(() => createPending.value || requestInFlight.value)

function retryDependencies(): void {
  if (studentsError.value) void refetchStudents()
  if (coursesError.value) void refetchCourses()
}

async function handleSubmit(values: GradeFormValues): Promise<void> {
  if (
    values.studentId === null ||
    values.courseId === null ||
    requestInFlight.value ||
    createPending.value ||
    formBlocked.value
  ) return

  requestInFlight.value = true
  submitError.value = null

  try {
    await mutateGrade(values)
    await invalidateGradeDependencies(queryClient, values.studentId, values.courseId)
    await router.push({ name: 'grades' })
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      submitError.value = 'The selected student or course no longer exists. Please select an available option and try again.'
      await Promise.all([refetchStudents(), refetchCourses()])
    } else {
      submitError.value = 'A grade for this student and course already exists or could not be saved.'
    }
  } finally {
    requestInFlight.value = false
  }
}

function handleCancel(): void {
  if (!requestInFlight.value && !createPending.value) {
    void router.push({ name: 'grades' })
  }
}

function goToStudentCreate(): void {
  if (!requestInFlight.value) void router.push({ name: 'student-create' })
}

function goToCourseCreate(): void {
  if (!requestInFlight.value) void router.push({ name: 'course-create' })
}
</script>

<template>
  <section class="grade-create-page">
    <PageHeader title="Grade Management" subtitle="Submit Grade" />

    <BaseCard>
      <div
        v-if="dependenciesError"
        class="grade-create-page__state grade-create-page__state--error"
        role="alert"
      >
        <span>Unable to load students or courses. Please try again.</span>
        <BaseButton variant="secondary" size="sm" @click="retryDependencies">
          Retry
        </BaseButton>
      </div>

      <div
        v-else-if="dependenciesPending"
        class="grade-create-page__state"
        role="status"
        aria-live="polite"
      >
        Loading students and courses...
      </div>

      <div
        v-else-if="dependenciesEmpty"
        class="grade-create-page__empty"
      >
        <div v-if="students.length === 0" class="grade-create-page__empty-item">
          <span>No students are available. Add a student before submitting a grade.</span>
          <BaseButton variant="secondary" size="sm" @click="goToStudentCreate">
            Add Student
          </BaseButton>
        </div>
        <div v-if="courses.length === 0" class="grade-create-page__empty-item">
          <span>No courses are available. Add a course before submitting a grade.</span>
          <BaseButton variant="secondary" size="sm" @click="goToCourseCreate">
            Add Course
          </BaseButton>
        </div>
      </div>

      <GradeForm
        mode="create"
        :students="students"
        :courses="courses"
        :pending="submissionPending"
        :blocked="formBlocked"
        :submit-error="submitError"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </BaseCard>
  </section>
</template>

<style scoped lang="scss">
.grade-create-page {
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;

  &__state,
  &__empty {
    margin: 1.25rem 1.5rem 0;
    padding: 0.875rem 1rem;
    border-radius: var(--radius-sm);
    background: var(--color-surface-muted);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  &__state--error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__empty {
    display: grid;
    gap: 0.75rem;
  }

  &__empty-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }
}

@media (max-width: 639px) {
  .grade-create-page {
    &__state--error,
    &__empty-item {
      align-items: stretch;
      flex-direction: column;
    }
  }
}
</style>
