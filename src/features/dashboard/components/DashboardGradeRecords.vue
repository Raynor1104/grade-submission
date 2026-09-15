<script setup lang="ts">
import BaseCard from '@/shared/ui/BaseCard.vue'

import type { GradeViewModel } from '@/features/grades/model/grade.types'

defineProps<{
  grades: GradeViewModel[]
  isLoading: boolean
  isError: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <BaseCard
    class="grade-records"
    aria-labelledby="grade-records-title"
    :aria-busy="isLoading"
  >
    <header class="grade-records__header">
      <div>
        <h2 id="grade-records-title">
          Grade Records
        </h2>
        <p>A list of grade records in the system</p>
      </div>

      <RouterLink
        to="/grades"
        class="grade-records__link"
      >
        View all grades <span aria-hidden="true">→</span>
      </RouterLink>
    </header>

    <div
      v-if="isError"
      class="grade-records__state grade-records__state--error"
      role="alert"
    >
      <span>Grade records are unavailable.</span>
      <button
        type="button"
        @click="emit('retry')"
      >
        Retry Grades
      </button>
    </div>

    <div
      v-else-if="isLoading"
      class="grade-records__state"
      role="status"
    >
      Loading grade records…
    </div>

    <div
      v-else-if="grades.length === 0"
      class="grade-records__state"
    >
      No grade records available.
    </div>

    <div
      v-else
      class="grade-records__table-wrap"
    >
      <table class="grade-records__table">
        <thead>
          <tr>
            <th scope="col">Student</th>
            <th scope="col">Course</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="grade in grades"
            :key="grade.id"
          >
            <td>{{ grade.student.name }}</td>
            <td>
              <span class="grade-records__course-code">
                {{ grade.course.code }}
              </span>
              <span
                v-if="grade.course.subject"
                class="grade-records__course-name"
              >
                {{ grade.course.subject }}
              </span>
            </td>
            <td>{{ grade.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
.grade-records {
  min-width: 0;
  padding: 1rem 1.5rem 0.75rem;
}

.grade-records__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.grade-records__header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.grade-records__header p {
  margin: 0.1rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.grade-records__link {
  flex: 0 0 auto;
  border-radius: 2px;
  color: var(--color-primary);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.grade-records__link:hover {
  text-decoration: underline;
}

.grade-records__link:focus-visible,
.grade-records__state button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.grade-records__state {
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  text-align: center;
}

.grade-records__state--error {
  color: var(--color-danger);
}

.grade-records__state button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.grade-records__table-wrap {
  overflow-x: auto;
  margin-top: 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.grade-records__table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
}

.grade-records__table th,
.grade-records__table td {
  padding: 0.55rem 1rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  vertical-align: middle;
}

.grade-records__table th {
  background: var(--color-surface-muted);
  font-size: 0.75rem;
  font-weight: 700;
}

.grade-records__table td {
  max-width: 340px;
  font-size: 0.8125rem;
  overflow-wrap: anywhere;
}

.grade-records__table tr:last-child td {
  border-bottom: 0;
}

.grade-records__course-code,
.grade-records__course-name {
  display: block;
}

.grade-records__course-code {
  font-weight: 600;
}

.grade-records__course-name {
  margin-top: 0.1rem;
  color: var(--color-text-secondary);
  font-size: 0.72rem;
}

@media (max-width: 639px) {
  .grade-records {
    padding-inline: 1rem;
  }

  .grade-records__header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
