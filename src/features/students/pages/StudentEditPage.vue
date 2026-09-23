<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useRoute, useRouter } from 'vue-router'

import { gradeKeys, studentKeys } from '@/core/api/query-keys'
import { ApiRequestError } from '@/core/api/types'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

import { updateStudent } from '../api/student.api'
import { studentQueries } from '../api/student.queries'
import StudentForm from '../components/StudentForm.vue'
import { normalizeStudentForm, type StudentFormValues } from '../model/student-form'

const route = useRoute()
const router = useRouter()
const queryClient = useQueryClient()
const submitError = ref<string | null>(null)
let requestInFlight = false

const studentId = computed(() => {
  const raw = route.params.id
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null
  const parsed = Number(raw)
  return Number.isSafeInteger(parsed) ? parsed : null
})

const detailOptions = computed(() => ({
  ...studentQueries.detail(studentId.value ?? 0),
  enabled: studentId.value !== null,
}))
const {
  data: student,
  isPending: detailPending,
  isError: detailError,
  error: detailFailure,
  refetch: refetchStudent,
} = useQuery(detailOptions)

const initialValues = computed<StudentFormValues | undefined>(() => student.value && ({
  name: student.value.name,
  birthDate: student.value.birthDate,
}))
const notFound = computed(() => studentId.value === null || (
  detailError.value && detailFailure.value instanceof ApiRequestError &&
  detailFailure.value.status === 404
))

watch(studentId, () => {
  submitError.value = null
})

const { isPending: updatePending, mutateAsync: mutateStudent } = useMutation({
  mutationFn: ({ id, values }: { id: number, values: StudentFormValues }) =>
    updateStudent(id, values),
  retry: false,
})

async function handleSubmit(values: StudentFormValues): Promise<void> {
  const id = studentId.value
  if (id === null || !student.value || student.value.id !== id ||
    requestInFlight || updatePending.value) return

  const current = normalizeStudentForm(values)
  const initial = normalizeStudentForm({
    name: student.value.name,
    birthDate: student.value.birthDate,
  })
  if (current.name === initial.name && current.birthDate === initial.birthDate) return

  requestInFlight = true
  submitError.value = null
  try {
    const updated = await mutateStudent({ id, values: current })
    queryClient.setQueryData(studentKeys.detail(id), updated)
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: studentKeys.all() }),
      queryClient.invalidateQueries({ queryKey: gradeKeys.root }),
    ])
    await router.push('/students')
  } catch {
    submitError.value = 'Unable to update student. Please try again.'
  } finally {
    requestInFlight = false
  }
}

function handleCancel(): void {
  if (!requestInFlight && !updatePending.value) void router.push('/students')
}
</script>

<template>
  <section class="student-edit-page">
    <PageHeader title="Student Management" subtitle="Edit Student" />

    <BaseCard v-if="notFound" class="student-edit-page__state" role="alert">
      <h2>Student Not Found</h2>
      <p>The requested student does not exist.</p>
      <BaseButton variant="secondary" @click="handleCancel">Back to Students</BaseButton>
    </BaseCard>

    <BaseCard v-else-if="detailError" class="student-edit-page__state" role="alert">
      <h2>Unable to load student</h2>
      <p>Please try again.</p>
      <BaseButton variant="secondary" @click="refetchStudent()">Retry</BaseButton>
    </BaseCard>

    <BaseCard v-else-if="detailPending || !student || student.id !== studentId"
      class="student-edit-page__state" role="status" aria-live="polite">
      Loading student...
    </BaseCard>

    <BaseCard v-else>
      <StudentForm
        :key="student.id"
        mode="edit"
        :student-id="student.id"
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
.student-edit-page {
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

    h2, p { margin: 0; }
    h2 { color: var(--color-text-primary); font-size: 1.125rem; }
  }
}
</style>
