<script setup lang="ts">
import BaseCard from '@/shared/ui/BaseCard.vue'

import type {
  CourseGradeCount,
  DashboardDataSource,
} from '../model/dashboard.types'

defineProps<{
  rows: CourseGradeCount[]
  isLoading: boolean
  errorSources: DashboardDataSource[]
}>()

const emit = defineEmits<{
  retry: [source: DashboardDataSource]
}>()

function getSourceLabel(source: DashboardDataSource): string {
  return source[0].toUpperCase() + source.slice(1)
}
</script>

<template>
  <BaseCard
    class="dashboard-panel course-grades"
    aria-labelledby="grades-by-course-title"
    :aria-busy="isLoading"
  >
    <header class="dashboard-panel__header">
      <div>
        <h2 id="grades-by-course-title">
          Grades by Course
        </h2>
        <p>Number of grade records for each course</p>
      </div>
    </header>

    <div
      v-if="errorSources.length"
      class="dashboard-panel__state dashboard-panel__state--error"
      role="alert"
    >
      <p>Course grade counts are unavailable.</p>
      <div class="dashboard-panel__retries">
        <button
          v-for="source in errorSources"
          :key="source"
          type="button"
          @click="emit('retry', source)"
        >
          Retry {{ getSourceLabel(source) }}
        </button>
      </div>
    </div>

    <div
      v-else-if="isLoading"
      class="dashboard-panel__state"
      role="status"
    >
      Loading course grade counts…
    </div>

    <div
      v-else-if="rows.length === 0"
      class="dashboard-panel__state"
    >
      No courses available.
    </div>

    <ul
      v-else
      class="course-grades__list"
    >
      <li
        v-for="row in rows"
        :key="row.courseId"
        class="course-grades__row"
      >
        <span
          class="course-grades__code"
          :title="row.courseName"
        >
          {{ row.courseCode }}
        </span>
        <span
          class="course-grades__track"
          aria-hidden="true"
        >
          <span
            class="course-grades__bar"
            :style="{ width: `${row.barPercent}%` }"
          />
        </span>
        <span class="course-grades__count">
          {{ row.gradeCount }}
          <span class="sr-only">grade records</span>
        </span>
      </li>
    </ul>

    <RouterLink
      to="/grades"
      class="dashboard-panel__link"
    >
      View all grades <span aria-hidden="true">→</span>
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

.dashboard-panel__retries {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.dashboard-panel__retries button {
  padding: 0.4rem 0.65rem;
  border: 1px solid var(--color-danger-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.dashboard-panel__retries button:focus-visible,
.dashboard-panel__link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.course-grades__list {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  gap: 0.65rem;
  margin: 0;
  padding: 1rem 0;
  list-style: none;
}

.course-grades__row {
  display: grid;
  grid-template-columns: minmax(68px, auto) minmax(80px, 1fr) minmax(28px, auto);
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.course-grades__code,
.course-grades__count {
  color: var(--color-text-primary);
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}

.course-grades__code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-grades__track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-border);
}

.course-grades__bar {
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

  .course-grades__row {
    gap: 0.5rem;
  }
}
</style>
