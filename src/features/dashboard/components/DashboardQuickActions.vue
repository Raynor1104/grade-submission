<script setup lang="ts">
import { Plus } from '@lucide/vue'

import BaseCard from '@/shared/ui/BaseCard.vue'
</script>

<template>
  <BaseCard
    class="quick-actions"
    aria-labelledby="quick-actions-title"
  >
    <div class="quick-actions__heading">
      <h2 id="quick-actions-title">
        Quick Actions
      </h2>
      <p>Get started with common tasks</p>
    </div>

    <div class="quick-actions__list">
      <RouterLink
        to="/students/new"
        class="quick-action quick-action--student"
      >
        <span
          class="quick-action__icon"
          aria-hidden="true"
        >
          <Plus :size="25" />
        </span>
        <span class="quick-action__copy">
          <strong>Add Student</strong>
          <span>Create a new student record</span>
        </span>
      </RouterLink>

      <RouterLink
        to="/courses/new"
        class="quick-action quick-action--course"
      >
        <span
          class="quick-action__icon"
          aria-hidden="true"
        >
          <Plus :size="25" />
        </span>
        <span class="quick-action__copy">
          <strong>Add Course</strong>
          <span>Create a new course record</span>
        </span>
      </RouterLink>

      <div
        class="quick-action quick-action--grade quick-action--disabled"
        aria-disabled="true"
        aria-describedby="submit-grade-unavailable"
      >
        <span
          class="quick-action__icon"
          aria-hidden="true"
        >
          <Plus :size="25" />
        </span>
        <span class="quick-action__copy">
          <strong>Submit Grade</strong>
          <span>Add grade for a student</span>
          <small id="submit-grade-unavailable">
            Unavailable until grade submission is implemented
          </small>
        </span>
      </div>
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
.quick-actions {
  display: grid;
  grid-template-columns: minmax(190px, 0.85fr) minmax(0, 2.15fr);
  align-items: center;
  gap: 1.25rem;
  padding: 0.75rem 1.5rem;
}

.quick-actions__heading h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
}

.quick-actions__heading p {
  margin: 0.15rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.quick-actions__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.quick-action {
  display: flex;
  min-width: 0;
  min-height: 68px;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 1rem;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: inherit;
  text-decoration: none;
  transition: border-color 150ms ease, transform 150ms ease;
}

.quick-action:not(.quick-action--disabled):hover {
  border-color: currentcolor;
  transform: translateY(-1px);
}

.quick-action:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.quick-action--student {
  background: var(--color-info-light);
  color: var(--color-info);
}

.quick-action--course {
  background: var(--color-success-light);
  color: var(--color-success);
}

.quick-action--grade {
  background: var(--color-accent-light);
  color: var(--color-accent);
}

.quick-action--disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.quick-action__icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.55);
}

.quick-action__copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.quick-action__copy strong {
  font-size: 0.875rem;
  font-weight: 700;
}

.quick-action__copy span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  line-height: 1.35;
}

.quick-action__copy small {
  margin-top: 0.15rem;
  color: var(--color-text-muted);
  font-size: 0.675rem;
  line-height: 1.25;
}

@media (max-width: 1023px) {
  .quick-actions {
    grid-template-columns: 1fr;
    padding-block: 1.25rem;
  }
}

@media (max-width: 767px) {
  .quick-actions__list {
    grid-template-columns: 1fr;
  }
}
</style>
