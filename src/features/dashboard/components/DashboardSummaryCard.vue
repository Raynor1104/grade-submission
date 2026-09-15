<script setup lang="ts">
import BaseCard from '@/shared/ui/BaseCard.vue'

defineProps<{
  label: string
  count: number | null
  isLoading: boolean
  isError: boolean
}>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <BaseCard
    class="summary-card"
    :aria-busy="isLoading"
  >
    <div
      class="summary-card__icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </div>

    <div class="summary-card__content">
      <h2 class="summary-card__label">
        {{ label }}
      </h2>

      <div
        v-if="isError"
        class="summary-card__error"
        role="alert"
      >
        <span>Unable to load.</span>
        <button
          type="button"
          class="summary-card__retry"
          :aria-label="`Retry loading ${label}`"
          @click="emit('retry')"
        >
          Retry
        </button>
      </div>

      <div
        v-else-if="isLoading"
        class="summary-card__loading"
        role="status"
      >
        <span class="sr-only">Loading {{ label }}</span>
      </div>

      <p
        v-else
        class="summary-card__count"
      >
        {{ count }}
      </p>
    </div>
  </BaseCard>
</template>

<style scoped lang="scss">
.summary-card {
  display: flex;
  min-width: 0;
  min-height: 108px;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
}

.summary-card__icon {
  display: grid;
  width: 56px;
  height: 56px;
  flex: 0 0 56px;
  place-items: center;
  border-radius: 999px;
  background: var(--color-info-light);
  color: var(--color-primary);
}

.summary-card__content {
  min-width: 0;
}

.summary-card__label {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  font-weight: 600;
}

.summary-card__count {
  margin: 0.2rem 0 0;
  color: var(--color-primary);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  font-weight: 700;
  line-height: 1.05;
  overflow-wrap: anywhere;
}

.summary-card__loading {
  width: 72px;
  height: 28px;
  margin-top: 0.45rem;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-surface-muted) 25%,
    var(--color-border) 50%,
    var(--color-surface-muted) 75%
  );
  background-size: 200% 100%;
  animation: dashboard-pulse 1.4s ease-in-out infinite;
}

.summary-card__error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.45rem;
  color: var(--color-danger);
  font-size: 0.8125rem;
}

.summary-card__retry {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-primary);
  font: inherit;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.summary-card__retry:focus-visible {
  border-radius: 2px;
  outline: 2px solid var(--color-primary);
  outline-offset: 3px;
}

@keyframes dashboard-pulse {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .summary-card__loading {
    animation: none;
  }
}
</style>
