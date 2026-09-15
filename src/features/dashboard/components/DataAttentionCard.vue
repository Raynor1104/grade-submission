<script setup lang="ts">
import { TriangleAlert } from '@lucide/vue'

import BaseCard from '@/shared/ui/BaseCard.vue'

import type { DashboardDataSource } from '../model/dashboard.types'

const props = defineProps<{
  studentsWithoutGrades: number | null
  coursesWithoutGrades: number | null
  studentLoading: boolean
  courseLoading: boolean
  studentErrorSources: DashboardDataSource[]
  courseErrorSources: DashboardDataSource[]
}>()

const emit = defineEmits<{
  retry: [source: DashboardDataSource]
}>()

function retrySources(sources: DashboardDataSource[]): void {
  for (const source of sources) {
    emit('retry', source)
  }
}
</script>

<template>
  <BaseCard
    class="attention-card"
    aria-labelledby="data-attention-title"
    :aria-busy="studentLoading || courseLoading"
  >
    <header class="attention-card__header">
      <h2 id="data-attention-title">
        Data Attention
      </h2>
      <p>Items that may need your attention</p>
    </header>

    <div class="attention-card__items">
      <article class="attention-item attention-item--danger">
        <TriangleAlert
          :size="26"
          aria-hidden="true"
        />
        <div class="attention-item__copy">
          <h3>Students without grades</h3>
          <p>Students who do not have any grade records</p>
          <button
            v-if="studentErrorSources.length"
            type="button"
            @click="retrySources(studentErrorSources)"
          >
            Retry unavailable data
          </button>
        </div>
        <span
          v-if="studentErrorSources.length"
          class="attention-item__unavailable"
          role="alert"
        >
          Unavailable
        </span>
        <span
          v-else-if="studentLoading"
          class="attention-item__loading"
          role="status"
        >
          Loading
        </span>
        <strong v-else class="attention-item__value">
          {{ studentsWithoutGrades }}
        </strong>
      </article>

      <article class="attention-item attention-item--warning">
        <TriangleAlert
          :size="26"
          aria-hidden="true"
        />
        <div class="attention-item__copy">
          <h3>Courses without grades</h3>
          <p>Courses that do not have any grade records</p>
          <button
            v-if="courseErrorSources.length"
            type="button"
            @click="retrySources(courseErrorSources)"
          >
            Retry unavailable data
          </button>
        </div>
        <span
          v-if="courseErrorSources.length"
          class="attention-item__unavailable"
          role="alert"
        >
          Unavailable
        </span>
        <span
          v-else-if="courseLoading"
          class="attention-item__loading"
          role="status"
        >
          Loading
        </span>
        <strong v-else class="attention-item__value">
          {{ coursesWithoutGrades }}
        </strong>
      </article>
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
.attention-card {
  min-width: 0;
  min-height: 270px;
  padding: 1rem 1.5rem;
}

.attention-card__header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.attention-card__header p {
  margin: 0.1rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.attention-card__items {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.attention-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.875rem;
  min-height: 78px;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
}

.attention-item--danger {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.attention-item--warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.attention-item__copy {
  min-width: 0;
}

.attention-item__copy h3,
.attention-item__copy p {
  margin: 0;
}

.attention-item__copy h3 {
  color: var(--color-text-primary);
  font-size: 0.875rem;
  font-weight: 700;
}

.attention-item__copy p {
  margin-top: 0.1rem;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  line-height: 1.35;
}

.attention-item__copy button {
  margin-top: 0.25rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.attention-item__copy button:focus-visible {
  border-radius: 2px;
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.attention-item__value {
  font-size: 1.75rem;
  font-variant-numeric: tabular-nums;
}

.attention-item__unavailable,
.attention-item__loading {
  color: var(--color-text-secondary);
  font-size: 0.72rem;
  font-weight: 600;
}

@media (max-width: 479px) {
  .attention-card {
    padding-inline: 1rem;
  }

  .attention-item {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .attention-item__value,
  .attention-item__unavailable,
  .attention-item__loading {
    grid-column: 2;
    justify-self: start;
  }
}
</style>
