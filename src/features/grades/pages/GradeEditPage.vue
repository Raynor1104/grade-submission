<script setup lang="ts">
import {
  computed,
  nextTick,
  ref,
  watch,
} from 'vue'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'

import { gradeKeys } from '@/core/api/query-keys'
import { ApiRequestError } from '@/core/api/types'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import DeleteConfirmDialog from '@/shared/ui/DeleteConfirmDialog.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

import {
  deleteGrade,
  updateGrade,
} from '../api/grade.api'
import {
  gradeQueries,
  invalidateGradeDependencies,
} from '../api/grade.queries'
import GradeForm from '../components/GradeForm.vue'
import {
  normalizeGradeForm,
  parsePositiveRouteId,
  type GradeFormValues,
} from '../model/grade-form'
import type {
  GradeCourse,
  GradeStudent,
} from '../model/grade.types'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const submitError = ref<string | null>(null)
const updateNotFound = ref(false)
const deleteDialogOpen = ref(false)
const deleteError = ref<string | null>(null)
const deleteTrigger = ref<HTMLElement | null>(null)
const requestInFlight = ref<'update' | 'delete' | null>(null)

const studentId = computed(() => parsePositiveRouteId(route.params.studentId))
const courseId = computed(() => parsePositiveRouteId(route.params.courseId))
const hasValidPair = computed(() => studentId.value !== null && courseId.value !== null)

const pairOptions = computed(() => ({
  ...gradeQueries.pair(studentId.value ?? 0, courseId.value ?? 0),
  enabled: hasValidPair.value,
}))

const {
  data: grade,
  isPending: pairPending,
  isError: pairError,
  error: pairFailure,
  refetch: refetchGrade,
} = useQuery(pairOptions)

const currentGrade = computed(() => {
  if (
    !grade.value ||
    grade.value.student.id !== studentId.value ||
    grade.value.course.id !== courseId.value
  ) return null

  return grade.value
})

const initialValues = computed<GradeFormValues | undefined>(() => {
  if (!currentGrade.value) return undefined

  return {
    studentId: currentGrade.value.student.id,
    courseId: currentGrade.value.course.id,
    score: currentGrade.value.score,
  }
})

const students = computed<GradeStudent[]>(() => (
  currentGrade.value ? [currentGrade.value.student] : []
))
const courses = computed<GradeCourse[]>(() => (
  currentGrade.value ? [currentGrade.value.course] : []
))

const notFound = computed(() => !hasValidPair.value || updateNotFound.value || (
  pairError.value &&
  pairFailure.value instanceof ApiRequestError &&
  pairFailure.value.status === 404
))

watch([studentId, courseId], () => {
  submitError.value = null
  updateNotFound.value = false
  deleteDialogOpen.value = false
  deleteError.value = null
  deleteTrigger.value = null
})

const { isPending: updatePending, mutateAsync: mutateGrade } = useMutation({
  mutationFn: ({
    targetStudentId,
    targetCourseId,
    score,
  }: {
    targetStudentId: number
    targetCourseId: number
    score: string
  }) => updateGrade(targetStudentId, targetCourseId, { score }),
  retry: false,
})

const { isPending: deletePending, mutateAsync: removeGrade } = useMutation({
  mutationFn: ({
    targetStudentId,
    targetCourseId,
  }: {
    targetStudentId: number
    targetCourseId: number
  }) => deleteGrade(targetStudentId, targetCourseId),
  retry: false,
})

const mutationPending = computed(() => (
  updatePending.value || deletePending.value || requestInFlight.value !== null
))

async function handleSubmit(values: GradeFormValues): Promise<void> {
  const targetStudentId = studentId.value
  const targetCourseId = courseId.value
  const current = currentGrade.value

  if (
    targetStudentId === null ||
    targetCourseId === null ||
    !current ||
    requestInFlight.value ||
    mutationPending.value
  ) return

  const normalized = normalizeGradeForm(values)
  if (normalized.score === current.score.trim()) return

  requestInFlight.value = 'update'
  submitError.value = null

  try {
    const updated = await mutateGrade({
      targetStudentId,
      targetCourseId,
      score: normalized.score,
    })
    queryClient.setQueryData(
      gradeKeys.pair(targetStudentId, targetCourseId),
      updated,
    )
    await invalidateGradeDependencies(queryClient, targetStudentId, targetCourseId)
    await router.push({ name: 'grades' })
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      updateNotFound.value = true
      return
    }

    submitError.value = 'Unable to update the grade. Please try again.'
  } finally {
    requestInFlight.value = null
  }
}

function handleDelete(): void {
  if (!currentGrade.value || requestInFlight.value || mutationPending.value) return

  deleteTrigger.value = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : null
  deleteError.value = null
  deleteDialogOpen.value = true
}

function closeDeleteDialog(): void {
  if (deletePending.value || requestInFlight.value === 'delete') return

  const trigger = deleteTrigger.value
  deleteDialogOpen.value = false
  deleteError.value = null
  deleteTrigger.value = null

  void nextTick(() => trigger?.focus())
}

async function handleConfirmDelete(): Promise<void> {
  const targetStudentId = studentId.value
  const targetCourseId = courseId.value

  if (
    targetStudentId === null ||
    targetCourseId === null ||
    !currentGrade.value ||
    requestInFlight.value ||
    deletePending.value
  ) return

  requestInFlight.value = 'delete'
  deleteError.value = null

  try {
    await removeGrade({ targetStudentId, targetCourseId })
    queryClient.removeQueries({
      queryKey: gradeKeys.pair(targetStudentId, targetCourseId),
      exact: true,
    })
    await invalidateGradeDependencies(queryClient, targetStudentId, targetCourseId)
    deleteDialogOpen.value = false
    await router.push({ name: 'grades' })
  } catch {
    deleteError.value = 'Unable to delete grade. Please try again.'
  } finally {
    requestInFlight.value = null
  }
}

function handleCancel(): void {
  if (!requestInFlight.value && !mutationPending.value) {
    void router.push({ name: 'grades' })
  }
}

function backToGrades(): void {
  if (!requestInFlight.value && !mutationPending.value) {
    void router.push({ name: 'grades' })
  }
}
</script>

<template>
  <section class="grade-edit-page">
    <PageHeader title="Grade Management" subtitle="Update Grade" />

    <BaseCard
      v-if="notFound"
      class="grade-edit-page__state"
      role="alert"
    >
      <h2>Grade Not Found</h2>
      <p>The requested grade does not exist or is no longer available.</p>
      <BaseButton variant="secondary" @click="backToGrades">
        Back to Grades
      </BaseButton>
    </BaseCard>

    <BaseCard
      v-else-if="pairError"
      class="grade-edit-page__state"
      role="alert"
    >
      <h2>Unable to load grade</h2>
      <p>Please try again.</p>
      <BaseButton variant="secondary" @click="refetchGrade()">
        Retry
      </BaseButton>
    </BaseCard>

    <BaseCard
      v-else-if="pairPending || !currentGrade"
      class="grade-edit-page__state"
      role="status"
      aria-live="polite"
    >
      Loading grade...
    </BaseCard>

    <BaseCard v-else>
      <GradeForm
        :key="`${currentGrade.student.id}:${currentGrade.course.id}`"
        mode="edit"
        :initial-values="initialValues"
        :students="students"
        :courses="courses"
        :pending="mutationPending"
        :submit-error="submitError"
        @submit="handleSubmit"
        @delete="handleDelete"
        @cancel="handleCancel"
      />
    </BaseCard>

    <DeleteConfirmDialog
      v-if="deleteDialogOpen && currentGrade"
      title="Delete grade?"
      :message="`Are you sure you want to delete the grade for ${currentGrade.student.name} in ${currentGrade.course.code}?`"
      :is-deleting="mutationPending"
      :error="deleteError"
      @cancel="closeDeleteDialog"
      @confirm="handleConfirmDelete"
    />
  </section>
</template>

<style scoped lang="scss">
.grade-edit-page {
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
