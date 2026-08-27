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
    <div class="flex flex-col gap-4 border-b border-(--color-border) p-5 md:flex-row md:items-end md:justify-between">
        <div class="w-full max-w-md">
            <BaseInput
                :model-value="search"
                placeholder="Search by course name or code"
                @update:model-value="
                    emit('update:search', $event)
                "
            />
        </div>

        <BaseButton class="w-full md:w-auto" @click="emit('create')">
            <Plus :size="16"/>
            Add Course
        </BaseButton>
    </div>
</template>