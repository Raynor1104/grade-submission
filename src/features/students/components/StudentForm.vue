<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Save, UserRound, X } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'

import {
  EMPTY_STUDENT_FORM,
  localDateToday,
  normalizeStudentForm,
  validateStudentForm,
  type StudentFormMode,
  type StudentFormValues,
} from '../model/student-form'

const props = withDefaults(defineProps<{
  mode: StudentFormMode
  studentId?: number
  initialValues?: StudentFormValues
  pending?: boolean
  submitError?: string | null
}>(), {
  pending: false,
  submitError: null,
})

const emit = defineEmits<{
  submit: [values: StudentFormValues]
  cancel: []
}>()

const formElement = ref<HTMLFormElement | null>(null)
const values = ref<StudentFormValues>({ ...(props.initialValues ?? EMPTY_STUDENT_FORM) })
const touched = ref({ name: false, birthDate: false })
const submitted = ref(false)
const errors = computed(() => validateStudentForm(values.value))
const today = computed(() => localDateToday())
const isPristine = computed(() => {
  if (props.mode !== 'edit' || !props.initialValues) return false
  const current = normalizeStudentForm(values.value)
  const initial = normalizeStudentForm(props.initialValues)
  return current.name === initial.name && current.birthDate === initial.birthDate
})

watch(() => [props.mode, props.studentId] as const, () => {
  values.value = { ...(props.initialValues ?? EMPTY_STUDENT_FORM) }
  touched.value = { name: false, birthDate: false }
  submitted.value = false
})

function visibleError(field: keyof StudentFormValues): string | undefined {
  return submitted.value || touched.value[field] ? errors.value[field] : undefined
}

function focusFirstError(): void {
  const field = errors.value.name ? 'student-name' : 'student-birth-date'
  formElement.value?.querySelector<HTMLInputElement>(`#${field}`)?.focus()
}

function handleSubmit(): void {
  if (props.pending || isPristine.value) return
  submitted.value = true
  if (Object.keys(errors.value).length > 0) {
    focusFirstError()
    return
  }
  emit('submit', normalizeStudentForm(values.value))
}
</script>

<template>
  <form
    ref="formElement"
    class="student-form"
    novalidate
    :aria-busy="pending ? 'true' : undefined"
    @submit.prevent="handleSubmit"
  >
    <div class="student-form__heading">
      <span class="student-form__icon" aria-hidden="true">
        <UserRound :size="22" :stroke-width="1.8" />
      </span>
      <h2>Student Information</h2>
    </div>

    <div class="student-form__fields">
      <div class="student-form__id-field">
        <span class="student-form__label">Student ID</span>
        <output class="student-form__id-value">
          {{ mode === 'edit' ? studentId : 'Auto-generated after saving' }}
        </output>
        <p class="student-form__helper">
          {{ mode === 'edit' ? 'Student ID cannot be changed.' : 'Student ID is created by the system.' }}
        </p>
      </div>

      <BaseInput
        id="student-name"
        v-model="values.name"
        label="Full Name"
        placeholder="Enter full name"
        required
        :disabled="pending"
        :error="visibleError('name')"
        @blur="touched.name = true"
      />

      <BaseInput
        id="student-birth-date"
        v-model="values.birthDate"
        label="Birth Date"
        type="date"
        required
        helper="Display format: yyyy/MM/dd"
        :max="today"
        :disabled="pending"
        :error="visibleError('birthDate')"
        @blur="touched.birthDate = true"
      />
    </div>

    <p v-if="submitError" class="student-form__error" role="alert">
      {{ submitError }}
    </p>

    <div class="student-form__actions">
      <BaseButton
        type="submit"
        :loading="pending"
        :disabled="pending || isPristine"
      >
        <Save :size="17" aria-hidden="true" />
        {{ mode === 'edit' ? 'Update Student' : 'Save Student' }}
      </BaseButton>
      <BaseButton
        type="button"
        variant="secondary"
        :disabled="pending"
        @click="emit('cancel')"
      >
        <X :size="18" aria-hidden="true" />
        Cancel
      </BaseButton>
    </div>
  </form>
</template>

<style scoped lang="scss">
.student-form {
  padding: 1.75rem 1.5rem 1.5rem;

  &__heading {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    h2 {
      margin: 0;
      color: var(--color-text-primary);
      font-size: 1.125rem;
      font-weight: 650;
    }
  }

  &__icon {
    display: inline-flex;
    width: 2.25rem;
    height: 2.25rem;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border);
    border-radius: 50%;
    color: var(--color-primary);
  }

  &__fields {
    display: grid;
    gap: 1.25rem;
  }

  &__id-field {
    display: grid;
    gap: 0.375rem;
  }

  &__label {
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  &__id-value {
    display: flex;
    min-height: 36px;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    font-size: 0.875rem;
  }

  &__helper {
    margin: 0;
    color: var(--color-text-secondary);
    font-size: 0.75rem;
  }

  &__error {
    margin: 1rem 0 0;
    color: var(--color-danger);
    font-size: 0.875rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  &__actions :deep(.base-button) {
    min-width: 8.5rem;
    min-height: 40px;
  }
}

@media (max-width: 639px) {
  .student-form {
    padding: 1.25rem;

    &__actions {
      flex-direction: column;
    }

    &__actions :deep(.base-button) {
      width: 100%;
    }
  }
}
</style>
