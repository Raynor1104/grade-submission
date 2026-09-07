<script setup lang="ts">
import { Pencil } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'

import type { GradeViewModel } from '../model/grade.types'

defineProps<{
  grades: GradeViewModel[]
}>()

const emit = defineEmits<{
  edit: [grade: GradeViewModel]
}>()
</script>

<template>
  <div class="grade-table-wrap">
    <div class="overflow-x-auto rounded-(--radius-md) border border-(--color-border)">
      <table class="grade-table min-w-225">
        <thead>
          <tr>
            <th class="w-30">Student ID</th>
            <th>Student Name</th>
            <th class="w-38">Course Code</th>
            <th>Course Name</th>
            <th class="w-28">Grade</th>
            <th class="w-34">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="grade in grades"
            :key="grade.id"
          >
            <td>{{ grade.student.id }}</td>
            <td>{{ grade.student.name }}</td>
            <td>{{ grade.course.code }}</td>
            <td>{{ grade.course.name }}</td>
            <td>{{ grade.score }}</td>
            <td>
              <BaseButton
                size="sm"
                variant="secondary"
                class="grade-table__edit"
                @click="emit('edit', grade)"
              >
                <Pencil :size="14" />
                Edit
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.grade-table-wrap {
  padding: 1.25rem 1.75rem 0;
}

.grade-table {
  width: 100%;
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

    &:last-child td {
      border-bottom: 0;
    }
  }

  &__edit {
    min-width: 88px;
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

@media (max-width: 767px) {
  .grade-table-wrap {
    padding: 1rem 1.25rem 0;
  }
}
</style>
