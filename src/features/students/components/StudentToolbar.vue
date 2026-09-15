<script setup lang="ts">
import { Plus } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'

defineProps<{
  search: string
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  create: []
}>()
</script>

<template>
  <div class="student-toolbar">
    <div class="student-toolbar__search">
      <BaseInput
        id="student-search"
        :model-value="search"
        aria-label="Search students by name or ID"
        placeholder="Search by student name or ID"
        @update:model-value="emit('update:search', $event)"
      />
    </div>

    <BaseButton
      class="w-full md:w-auto"
      @click="emit('create')"
    >
      <Plus :size="16" />
      Add Student
    </BaseButton>
  </div>
</template>

<style scoped lang="scss">
.student-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);

  &__search {
    width: 100%;
  }
}

@media (min-width: 768px) {
  .student-toolbar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    &__search {
      max-width: 32rem;
    }
  }
}
</style>
