<script setup lang="ts">
import {
  computed,
  useId,
} from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    id?: string
    label?: string
    ariaLabel?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    error?: string
    helper?: string
    rows?: number
  }>(),
  {
    modelValue: '',
    disabled: false,
    required: false,
    rows: 4,
  },
)

const generatedId = useId()
const textareaId = computed(() => props.id ?? generatedId)
const messageId = computed(() => `${textareaId.value}-message`)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

function handleInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div class="base-textarea">
    <label
      v-if="label"
      class="base-textarea__label"
      :for="textareaId"
    >
      {{ label }}

      <span
        v-if="required"
        class="base-textarea__required"
      >
        *
      </span>
    </label>

    <textarea
      :id="textareaId"
      :value="props.modelValue"
      :aria-label="ariaLabel"
      :aria-describedby="error || helper ? messageId : undefined"
      :aria-invalid="error ? 'true' : undefined"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      class="base-textarea__control"
      :class="{
        'base-textarea__control--error': error,
      }"
      @input="handleInput"
      @blur="emit('blur')"
    />

    <p
      v-if="error"
      :id="messageId"
      class="base-textarea__error"
    >
      {{ error }}
    </p>

    <p
      v-else-if="helper"
      :id="messageId"
      class="base-textarea__helper"
    >
      {{ helper }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.base-textarea {
  display: flex;
  min-width: 0;
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
    min-height: 6rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    outline: none;
    resize: vertical;
    transition:
      border-color 150ms ease,
      box-shadow 150ms ease;

    &::placeholder {
      color: var(--color-text-muted);
    }

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgb(6 69 173 / 0.12);
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

  &__helper,
  &__error {
    margin: 0;
    font-size: 0.75rem;
  }

  &__helper {
    color: var(--color-text-secondary);
  }

  &__error {
    color: var(--color-danger);
  }
}
</style>
