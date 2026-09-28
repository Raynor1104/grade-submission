<script setup lang="ts">
import { computed, ref } from 'vue'
import { Info, Save, X } from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseTextarea from '@/shared/ui/BaseTextarea.vue'

import {
  EMPTY_COURSE_FORM,
  normalizeCourseForm,
  validateCourseForm,
  type CourseFormMode,
  type CourseFormValues,
} from '../model/course-form'

const props = withDefaults(defineProps<{
  mode: CourseFormMode
  initialValues?: CourseFormValues
  pending?: boolean
  submitError?: string | null
}>(), {
  pending: false,
  submitError: null,
})

const emit = defineEmits<{
  submit: [values: CourseFormValues]
  cancel: []
}>()

const formElement = ref<HTMLFormElement | null>(null)
const initialSnapshot = normalizeCourseForm(props.initialValues ?? EMPTY_COURSE_FORM)
const values = ref<CourseFormValues>({ ...(props.initialValues ?? EMPTY_COURSE_FORM) })
const touched = ref<Record<keyof CourseFormValues, boolean>>({
  code: false,
  subject: false,
  description: false,
})
const submitted = ref(false)
const errors = computed(() => validateCourseForm(values.value))
const isPristine = computed(() => {
  if (props.mode !== 'edit') return false

  const current = normalizeCourseForm(values.value)
  return current.code === initialSnapshot.code &&
    current.subject === initialSnapshot.subject &&
    current.description === initialSnapshot.description
})

function visibleError(field: keyof CourseFormValues): string | undefined {
  return submitted.value || touched.value[field] ? errors.value[field] : undefined
}

function focusFirstError(): void {
  const field = errors.value.code
    ? 'course-code'
    : errors.value.subject
      ? 'course-subject'
      : 'course-description'

  formElement.value?.querySelector<HTMLElement>(`#${field}`)?.focus()
}

function handleSubmit(): void {
  if (props.pending || isPristine.value) return

  submitted.value = true
  if (Object.keys(errors.value).length > 0) {
    focusFirstError()
    return
  }

  emit('submit', normalizeCourseForm(values.value))
}
</script>

<template>
  <form
    ref="formElement"
    class="course-form"
    novalidate
    :aria-busy="pending ? 'true' : undefined"
    @submit.prevent="handleSubmit"
  >
    <div class="course-form__heading">
      <span class="course-form__icon" aria-hidden="true">
        <Info :size="22" :stroke-width="1.8" />
      </span>
      <h2>Course Information</h2>
    </div>

    <div class="course-form__fields">
      <BaseInput
        id="course-code"
        v-model="values.code"
        label="Course Code"
        required
        helper="Enter a unique code for the course (e.g., JAVA101)"
        :disabled="pending"
        :error="visibleError('code')"
        @blur="touched.code = true"
      />

      <BaseInput
        id="course-subject"
        v-model="values.subject"
        label="Course Name (Subject)"
        required
        helper="Enter the name of the course"
        :disabled="pending"
        :error="visibleError('subject')"
        @blur="touched.subject = true"
      />

      <BaseTextarea
        id="course-description"
        v-model="values.description"
        label="Description"
        required
        helper="Enter a brief description of the course"
        :disabled="pending"
        :error="visibleError('description')"
        @blur="touched.description = true"
      />
    </div>

    <p
      v-if="submitError"
      class="course-form__error"
      role="alert"
    >
      {{ submitError }}
    </p>

    <div class="course-form__actions">
      <BaseButton
        type="submit"
        :loading="pending"
        :disabled="pending || isPristine"
      >
        <Save :size="17" aria-hidden="true" />
        {{ mode === 'edit' ? 'Update Course' : 'Save Course' }}
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
.course-form {
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
    min-width: 0;
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
    padding-top: 1rem;
    border-top: 1px solid var(--color-border);
  }

  &__actions :deep(.base-button) {
    min-width: 8.5rem;
    min-height: 40px;
  }
}

@media (max-width: 639px) {
  .course-form {
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
