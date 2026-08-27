<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger'
    size?: 'sm' | 'md'
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
  },
)
</script>

<template>
  <button
    :type="type"
    class="base-button"
    :class="[
      `base-button--${variant}`,
      `base-button--${size}`,
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading">
      Loading...
    </span>

    <slot v-else />
  </button>
</template>

<style scoped lang="scss">
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;

  border: 1px solid transparent;
  border-radius: var(--radius-sm);

  font-weight: 500;
  line-height: 1;

  cursor: pointer;

  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;

  &--md {
    min-height: 34px;
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  }

  &--sm {
    min-height: 28px;
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
  }

  &--primary {
    background: var(--color-primary);
    color: white;

    &:hover:not(:disabled) {
      background: var(--color-primary-hover);
    }
  }

  &--secondary {
    border-color: var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-primary);

    &:hover:not(:disabled) {
      background: var(--color-surface-muted);
    }
  }

  &--danger {
    border-color: var(--color-danger-border);
    background: var(--color-surface);
    color: var(--color-danger);

    &:hover:not(:disabled) {
      background: var(--color-danger-light);
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}
</style>