<script setup lang="ts">
import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { studentKeys } from '@/core/api/query-keys'
import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

import { createStudent } from '../api/student.api'
import StudentForm from '../components/StudentForm.vue'
import type { StudentFormValues } from '../model/student-form'

const router = useRouter()
const queryClient = useQueryClient()
const submitError = ref<string | null>(null)
let requestInFlight = false

const { isPending, mutateAsync } = useMutation({
  mutationFn: createStudent,
  retry: false,
})

async function handleSubmit(values: StudentFormValues): Promise<void> {
  if (requestInFlight || isPending.value) return
  requestInFlight = true
  submitError.value = null

  try {
    await mutateAsync(values)
    await queryClient.invalidateQueries({ queryKey: studentKeys.root })
    await router.push('/students')
  } catch {
    submitError.value = 'Unable to save student. Please try again.'
  } finally {
    requestInFlight = false
  }
}

function handleCancel(): void {
  if (!requestInFlight && !isPending.value) {
    void router.push('/students')
  }
}
</script>

<template>
  <section class="student-create-page">
    <PageHeader title="Student Management" subtitle="Add Student" />
    <BaseCard>
      <StudentForm
        mode="create"
        :pending="isPending"
        :submit-error="submitError"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </BaseCard>
  </section>
</template>

<style scoped lang="scss">
.student-create-page {
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;
}
</style>
