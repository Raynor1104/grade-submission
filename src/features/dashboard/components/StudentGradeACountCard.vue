<script setup lang="ts">
import BaseCard from '@/shared/ui/BaseCard.vue'

import type { StudentGradeACountRow } from '../model/dashboard.types'

defineProps<{
  rows: StudentGradeACountRow[]
  isLoading: boolean
  isError: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <BaseCard
    class="dashboard-panel student-a-grades"
    aria-labelledby="student-a-grades-title"
    :aria-busy="isLoading"
  >
    <header class="dashboard-panel__header">
      <div>
        <h2 id="student-a-grades-title">
          A Grades by Student
        </h2>
        <p>Number of A grades earned by each student</p>
      </div>
    </header>

    <div
      v-if="isError"
      class="dashboard-panel__state dashboard-panel__state--error"
      role="alert"
    >
      <p>Student A-grade counts are unavailable.</p>
      <button
        type="button"
        @click="emit('retry')"
      >
        Retry
      </button>
    </div>

    <div
      v-else-if="isLoading"
      class="dashboard-panel__state"
      role="status"
      aria-live="polite"
    >
      Loading student A-grade counts…
    </div>

    <div
      v-else-if="rows.length === 0"
      class="dashboard-panel__state"
    >
      No students available.
    </div>

    <ul
      v-else
      class="student-a-grades__list"
    >
      <li
        v-for="row in rows"
        :key="`${row.sourceIndex}-${row.studentName}-${row.gradeACount}`"
        class="student-a-grades__row"
      >
        <span
          class="student-a-grades__name"
          :title="row.studentName"
        >
          {{ row.studentName }}
        </span>
        <span
          class="student-a-grades__track"
          aria-hidden="true"
        >
          <span
            class="student-a-grades__bar"
            :style="{ width: `${row.barPercent}%` }"
          />
        </span>
        <span class="student-a-grades__count">
          {{ row.gradeACount }}
          <span class="sr-only">A grades</span>
        </span>
      </li>
    </ul>

    <RouterLink
      to="/students"
      class="dashboard-panel__link"
    >
      View all students <span aria-hidden="true">→</span>
    </RouterLink>
  </BaseCard>
</template>

<style scoped lang="scss">
.dashboard-panel {
  display: flex;
  min-width: 0;
  min-height: 270px;
  flex-direction: column;
  padding: 1rem 1.5rem;
}

.dashboard-panel__header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.dashboard-panel__header p {
  margin: 0.1rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.dashboard-panel__state {
  display: grid;
  min-height: 150px;
  flex: 1;
  place-content: center;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  text-align: center;
}

.dashboard-panel__state--error {
  color: var(--color-danger);
}

.dashboard-panel__state p {
  margin: 0;
}

.dashboard-panel__state button {
  justify-self: center;
  margin-top: 0.75rem;
  padding: 0.4rem 0.65rem;
  border: 1px solid var(--color-danger-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.dashboard-panel__state button:focus-visible,
.dashboard-panel__link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.student-a-grades__list {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 0.65rem;
  margin: 0;
  padding: 1rem 0;
  list-style: none;
}

.student-a-grades__row {
  display: grid;
  grid-template-columns: minmax(0, 9rem) minmax(80px, 1fr) minmax(28px, auto);
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.student-a-grades__name,
.student-a-grades__count {
  color: var(--color-text-primary);
  font-size: 0.8125rem;
}

.student-a-grades__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-a-grades__count {
  font-variant-numeric: tabular-nums;
}

.student-a-grades__track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-border);
}

.student-a-grades__bar {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--color-info), #54a3ff);
}

.dashboard-panel__link {
  align-self: flex-end;
  border-radius: 2px;
  color: var(--color-primary);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}

.dashboard-panel__link:hover {
  text-decoration: underline;
}

@media (max-width: 479px) {
  .dashboard-panel {
    padding-inline: 1rem;
  }

  .student-a-grades__row {
    grid-template-columns: minmax(0, 6.5rem) minmax(40px, 1fr) minmax(28px, auto);
    gap: 0.5rem;
  }
}
</style>
