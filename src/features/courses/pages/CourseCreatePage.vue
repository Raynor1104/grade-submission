<script setup lang="ts">
import { ref } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useRouter } from 'vue-router'

import { courseKeys } from '@/core/api/query-keys'
import BaseCard from '@/shared/ui/BaseCard.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

import { createCourse } from '../api/course.api'
import CourseForm from '../components/CourseForm.vue'
import type { CourseFormValues } from '../model/course-form'

const router = useRouter()
const queryClient = useQueryClient()
const submitError = ref<string | null>(null)
let requestInFlight = false

const { isPending, mutateAsync } = useMutation({
  mutationFn: createCourse,
  retry: false,
})

async function handleSubmit(values: CourseFormValues): Promise<void> {
  if (requestInFlight || isPending.value) return

  requestInFlight = true
  submitError.value = null

  try {
    const created = await mutateAsync(values)
    await queryClient.invalidateQueries({ queryKey: courseKeys.root })
    await router.push({ name: 'course-detail', params: { id: created.id } })
  } catch {
    submitError.value = 'Unable to save the course. Please review the information and try again.'
  } finally {
    requestInFlight = false
  }
}

function handleCancel(): void {
  if (!requestInFlight && !isPending.value) {
    void router.push({ name: 'courses' })
  }
}
</script>

<template>
  <section class="course-create-page">
    <PageHeader
      title="Course Management"
      subtitle="Add Course"
    />

    <BaseCard>
      <CourseForm
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
.course-create-page {
  width: 100%;
  max-width: 1100px;
  margin-inline: auto;
}
</style>
