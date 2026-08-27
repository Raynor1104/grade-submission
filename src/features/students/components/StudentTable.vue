<script setup lang="ts">
import {
  Eye,
  Pencil,
  Trash2,
} from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'

import type { StudentViewModel } from '../model/student.types'

import { formatDisplayDate } from '@/shared/utils/date'

defineProps<{
  students: StudentViewModel[]
}>()

const emit = defineEmits<{
  view: [student: StudentViewModel]
  delete: [student: StudentViewModel]
}>()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="student-table min-w-190">
      <thead>
        <tr>
          <th class="w-25">
            ID
          </th>

          <th>
            Student Name
          </th>

          <th class="w-45">
            Birth Date
          </th>

          <th class="w-70">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="student in students"
          :key="student.id"
        >
          <td>
            {{ student.id }}
          </td>

          <td class="font-medium">
            {{ student.name }}
          </td>

          <td>
            {{ formatDisplayDate(student.birthDate) }}
          </td>

          <td>
            <div class="flex items-center gap-2">
              <BaseButton
                size="sm"
                variant="secondary"
                @click="emit('view', student)"
              >
                <Eye :size="14" />

                View
              </BaseButton>

              <BaseButton
                size="sm"
                variant="secondary"
                disabled
                title="Edit is currently unavailable"
              >
                <Pencil :size="14" />

                Edit
              </BaseButton>

              <BaseButton
                size="sm"
                variant="danger"
                @click="emit('delete', student)"
              >
                <Trash2 :size="14" />

                Delete
              </BaseButton>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.student-table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem 1rem;

    border-bottom:
      1px solid var(--color-border);

    text-align: left;
    vertical-align: middle;
  }

  th {
    background: var(--color-surface-muted);

    color: var(--color-text-primary);

    font-size: 0.75rem;
    font-weight: 600;
  }

  td {
    color: var(--color-text-primary);

    font-size: 0.8125rem;
  }

  tbody {
    tr {
      transition:
        background-color 150ms ease;

      &:hover {
        background: var(--color-surface-muted);
      }

      &:last-child {
        td {
          border-bottom: 0;
        }
      }
    }
  }
}
</style>