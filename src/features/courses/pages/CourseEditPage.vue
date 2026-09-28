<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'

import { courseKeys, gradeKeys } from '@/core/api/query-keys'
import { ApiRequestError } from '@/core/api/types'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

import { updateCourse } from '../api/course.api'
import { courseQueries } from '../api/course.queries'
import CourseForm from '../components/CourseForm.vue'
import {
  normalizeCourseForm,
  type CourseFormValues,
} from '../model/course-form'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const submitError = ref<string | null>(null)
const updateNotFound = ref(false)
let requestInFlight = false

const courseId = computed(() => {
  const raw = route.params.id
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null

  const parsed = Number(raw)
  return Number.isSafeInteger(parsed) ? parsed : null
})

const detailOptions = computed(() => ({
  ...courseQueries.detail(courseId.value ?? 0),
  enabled: courseId.value !== null,
}))

const {
  data: course,
  isPending: detailPending,
  isError: detailError,
  error: detailFailure,
  refetch: refetchCourse,
} = useQuery(detailOptions)

const initialValues = computed<CourseFormValues | undefined>(() => course.value && ({
  code: course.value.code,
  subject: course.value.subject,
  description: course.value.description,
}))

const notFound = computed(() => courseId.value === null || updateNotFound.value || (
  detailError.value && detailFailure.value instanceof ApiRequestError &&
  detailFailure.value.status === 404
))

watch(courseId, () => {
  submitError.value = null
  updateNotFound.value = false
})

const { isPending: updatePending, mutateAsync: mutateCourse } = useMutation({
  mutationFn: ({ id, values }: { id: number, values: CourseFormValues }) =>
    updateCourse(id, values),
  retry: false,
})

async function handleSubmit(values: CourseFormValues): Promise<void> {
  const id = courseId.value
  if (id === null || !course.value || course.value.id !== id ||
    requestInFlight || updatePending.value) return

  const current = normalizeCourseForm(values)
  const initial = normalizeCourseForm({
    code: course.value.code,
    subject: course.value.subject,
    description: course.value.description,
  })
  if (current.code === initial.code && current.subject === initial.subject &&
    current.description === initial.description) return

  requestInFlight = true
  submitError.value = null

  try {
    const updated = await mutateCourse({ id, values: current })
    queryClient.setQueryData(courseKeys.detail(id), updated)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: courseKeys.all() }),
      queryClient.invalidateQueries({ queryKey: gradeKeys.root }),
    ])
    await router.push({ name: 'course-detail', params: { id } })
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      updateNotFound.value = true
      return
    }

    submitError.value = 'Unable to update the course. Please review the information and try again.'
  } finally {
    requestInFlight = false
  }
}

function handleCancel(): void {
  if (!requestInFlight && !updatePending.value) {
    void router.push({ name: 'courses' })
  }
}

function backToCourses(): void {
  if (!requestInFlight && !updatePending.value) {
    void router.push({ name: 'courses' })
  }
}
</script>

<template>
  <section class="course-edit-page">
    <PageHeader title="Course Management" subtitle="Edit Course" />

    <BaseCard
      v-if="notFound"
      class="course-edit-page__state"
      role="alert"
    >
      <h2>Course Not Found</h2>
      <p>The requested course does not exist.</p>
      <BaseButton variant="secondary" @click="backToCourses">
        Back to Courses
      </BaseButton>
    </BaseCard>

    <BaseCard
      v-else-if="detailError"
      class="course-edit-page__state"
      role="alert"
    >
      <h2>Unable to load course</h2>
      <p>Please try again.</p>
      <BaseButton variant="secondary" @click="refetchCourse()">
        Retry
      </BaseButton>
    </BaseCard>

    <BaseCard
      v-else-if="detailPending || !course || course.id !== courseId"
      class="course-edit-page__state"
      role="status"
      aria-live="polite"
    >
      Loading course...
    </BaseCard>

    <BaseCard v-else>
      <CourseForm
        :key="course.id"
        mode="edit"
        :initial-values="initialValues"
        :pending="updatePending"
        :submit-error="submitError"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </BaseCard>
  </section>
</template>

<style scoped lang="scss">
.course-edit-page {
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;

  &__state {
    display: grid;
    gap: 0.75rem;
    justify-items: start;
    min-height: 12rem;
    padding: 1.5rem;
    color: var(--color-text-secondary);

    h2,
    p {
      margin: 0;
    }

    h2 {
      color: var(--color-text-primary);
      font-size: 1.125rem;
    }
  }
}
</style>
