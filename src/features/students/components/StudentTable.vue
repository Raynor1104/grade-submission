<script setup lang="ts">
import {
  Eye,
  Pencil,
  Trash2,
} from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'
import { formatDisplayDate } from '@/shared/utils/date'

import type { StudentViewModel } from '../model/student.types'

defineProps<{
  students: StudentViewModel[]
}>()

const emit = defineEmits<{
  view: [student: StudentViewModel]
  delete: [student: StudentViewModel]
}>()
</script>

<template>
  <div class="student-table-wrap">
    <table class="student-table">
      <thead>
        <tr>
          <th class="w-28" scope="col">ID</th>
          <th scope="col">Student Name</th>
          <th class="w-52" scope="col">Birth Date</th>
          <th class="w-88" scope="col">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="student in students"
          :key="student.id"
        >
          <td>{{ student.id }}</td>
          <td class="student-table__name">{{ student.name }}</td>
          <td>{{ formatDisplayDate(student.birthDate) }}</td>
          <td>
            <div class="student-table__actions">
              <BaseButton
                size="sm"
                variant="secondary"
                class="student-table__view"
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
.student-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.student-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;

  th,
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-border);
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

  tbody tr {
    transition: background-color 150ms ease;

    &:hover {
      background: var(--color-surface-muted);
    }
  }

  &__name {
    max-width: 24rem;
    overflow-wrap: anywhere;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__view {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}
</style>
