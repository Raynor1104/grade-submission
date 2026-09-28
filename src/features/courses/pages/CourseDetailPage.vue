<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseButton from '@/shared/ui/BaseButton.vue'
import PageHeader from '@/shared/ui/PageHeader.vue'

const route = useRoute()
const router = useRouter()

const courseId = computed(() => {
  const raw = route.params.id
  if (typeof raw !== 'string' || !/^[1-9]\d*$/.test(raw)) return null

  const parsed = Number(raw)
  return Number.isSafeInteger(parsed) ? parsed : null
})

function handleEdit(): void {
  if (courseId.value !== null) {
    void router.push({ name: 'course-edit', params: { id: courseId.value } })
  }
}
</script>

<template>
  <section>
    <PageHeader
      title="Course Management"
      subtitle="Detail"
    />

    Course ID:
    {{ route.params.id }}

    <BaseButton
      v-if="courseId !== null"
      variant="secondary"
      @click="handleEdit"
    >
      Edit Course
    </BaseButton>
  </section>
</template>
