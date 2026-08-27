<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    type?: 'text' | 'password' | 'email'
    disabled?: boolean
    required?: boolean
    error?: string
    helper?: string
  }>(),
  {
    modelValue: '',
    type: 'text',
    disabled: false,
    required: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement

  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="base-input">
    <label
      v-if="label"
      class="base-input__label"
    >
      {{ label }}

      <span
        v-if="required"
        class="base-input__required"
      >
        *
      </span>
    </label>

    <input
      :value="props.modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="base-input__control"
      :class="{
        'base-input__control--error': error,
      }"
      @input="handleInput"
    />

    <p
      v-if="error"
      class="base-input__error"
    >
      {{ error }}
    </p>

    <p
      v-else-if="helper"
      class="base-input__helper"
    >
      {{ helper }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.base-input {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  &__label {
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  &__required {
    color: var(--color-danger);
  }

  &__control {
    width: 100%;
    min-height: 36px;

    padding: 0.5rem 0.75rem;

    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);

    background: var(--color-surface);

    color: var(--color-text-primary);
    font-size: 0.875rem;

    outline: none;

    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;

    &::placeholder {
      color: var(--color-text-muted);
    }

    &:focus {
      border-color: var(--color-primary);

      box-shadow:
        0 0 0 2px rgb(6 69 173 / 0.12);
    }

    &:disabled {
      cursor: not-allowed;
      background: var(--color-surface-muted);
      opacity: 0.7;
    }

    &--error {
      border-color: var(--color-danger);
    }
  }

  &__helper {
    margin: 0;

    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  &__error {
    margin: 0;

    color: var(--color-danger);
    font-size: 0.75rem;
  }
}
</style>