<script setup lang="ts">
import {
  computed,
  ref,
  watch,
} from 'vue'
import {
  ClipboardCheck,
  Save,
  Trash2,
  X,
} from '@lucide/vue'

import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'

import {
  EMPTY_GRADE_FORM,
  normalizeGradeForm,
  validateGradeForm,
  type GradeFormMode,
  type GradeFormValues,
} from '../model/grade-form'
import type {
  GradeCourse,
  GradeStudent,
} from '../model/grade.types'

const props = withDefaults(defineProps<{
  mode: GradeFormMode
  initialValues?: GradeFormValues
  students?: GradeStudent[]
  courses?: GradeCourse[]
  pending?: boolean
  blocked?: boolean
  submitError?: string | null
}>(), {
  students: () => [],
  courses: () => [],
  pending: false,
  blocked: false,
  submitError: null,
})

const emit = defineEmits<{
  submit: [values: GradeFormValues]
  cancel: []
  delete: []
}>()

const formElement = ref<HTMLFormElement | null>(null)
const values = ref<GradeFormValues>({ ...(props.initialValues ?? EMPTY_GRADE_FORM) })
const initialSnapshot = normalizeGradeForm(props.initialValues ?? EMPTY_GRADE_FORM)
const touched = ref<Record<keyof GradeFormValues, boolean>>({
  studentId: false,
  courseId: false,
  score: false,
})
const submitted = ref(false)

const studentIds = computed(() => props.students.map(student => student.id))
const courseIds = computed(() => props.courses.map(course => course.id))
const errors = computed(() => validateGradeForm(values.value, {
  mode: props.mode,
  studentIds: studentIds.value,
  courseIds: courseIds.value,
}))
const isPristine = computed(() => (
  props.mode === 'edit' &&
  normalizeGradeForm(values.value).score === initialSnapshot.score
))
const controlsDisabled = computed(() => props.pending || props.blocked)

const selectedStudent = computed(() => (
  props.students.find(student => student.id === values.value.studentId)
))
const selectedCourse = computed(() => (
  props.courses.find(course => course.id === values.value.courseId)
))

watch(
  () => [props.mode, props.initialValues?.studentId, props.initialValues?.courseId] as const,
  () => {
    values.value = { ...(props.initialValues ?? EMPTY_GRADE_FORM) }
    touched.value = { studentId: false, courseId: false, score: false }
    submitted.value = false
  },
)

watch(studentIds, ids => {
  if (
    props.mode === 'create' &&
    values.value.studentId !== null &&
    !ids.includes(values.value.studentId)
  ) {
    values.value.studentId = null
  }
})

watch(courseIds, ids => {
  if (
    props.mode === 'create' &&
    values.value.courseId !== null &&
    !ids.includes(values.value.courseId)
  ) {
    values.value.courseId = null
  }
})

function visibleError(field: keyof GradeFormValues): string | undefined {
  return submitted.value || touched.value[field] ? errors.value[field] : undefined
}

function selectId(event: Event): number | null {
  const raw = (event.target as HTMLSelectElement).value
  return raw ? Number(raw) : null
}

function focusFirstError(): void {
  const id = errors.value.studentId
    ? 'grade-student'
    : errors.value.courseId
      ? 'grade-course'
      : 'grade-score'

  formElement.value?.querySelector<HTMLElement>(`#${id}`)?.focus()
}

function handleSubmit(): void {
  if (controlsDisabled.value || isPristine.value) return

  submitted.value = true
  if (Object.keys(errors.value).length > 0) {
    focusFirstError()
    return
  }

  emit('submit', normalizeGradeForm(values.value))
}
</script>

<template>
  <form
    ref="formElement"
    class="grade-form"
    novalidate
    :aria-busy="pending ? 'true' : undefined"
    @submit.prevent="handleSubmit"
  >
    <div class="grade-form__heading">
      <span class="grade-form__icon" aria-hidden="true">
        <ClipboardCheck :size="22" :stroke-width="1.8" />
      </span>
      <h2>Grade Information</h2>
    </div>

    <div class="grade-form__fields">
      <div v-if="mode === 'create'" class="grade-form__field">
        <label class="grade-form__label" for="grade-student">
          Student <span class="grade-form__required">*</span>
        </label>
        <select
          id="grade-student"
          class="grade-form__select"
          :class="{ 'grade-form__select--error': visibleError('studentId') }"
          :value="values.studentId ?? ''"
          required
          :disabled="controlsDisabled"
          :aria-invalid="visibleError('studentId') ? 'true' : undefined"
          :aria-describedby="visibleError('studentId') ? 'grade-student-message' : undefined"
          @change="values.studentId = selectId($event)"
          @blur="touched.studentId = true"
        >
          <option value="">Select Student</option>
          <option
            v-for="student in students"
            :key="student.id"
            :value="student.id"
          >
            {{ student.name }} - ID: {{ student.id }}
          </option>
        </select>
        <p
          v-if="visibleError('studentId')"
          id="grade-student-message"
          class="grade-form__field-error"
        >
          {{ visibleError('studentId') }}
        </p>
      </div>

      <div v-else class="grade-form__field">
        <span id="grade-student-label" class="grade-form__label">
          Student <span class="grade-form__required">*</span>
        </span>
        <div
          id="grade-student"
          class="grade-form__readonly"
          tabindex="0"
          role="textbox"
          aria-readonly="true"
          aria-labelledby="grade-student-label"
          aria-describedby="grade-student-message"
        >
          {{ selectedStudent?.name ?? initialValues?.studentId }} - ID: {{ initialValues?.studentId }}
        </div>
        <p id="grade-student-message" class="grade-form__helper">
          Read-only. Student cannot be changed.
        </p>
      </div>

      <div v-if="mode === 'create'" class="grade-form__field">
        <label class="grade-form__label" for="grade-course">
          Course <span class="grade-form__required">*</span>
        </label>
        <select
          id="grade-course"
          class="grade-form__select"
          :class="{ 'grade-form__select--error': visibleError('courseId') }"
          :value="values.courseId ?? ''"
          required
          :disabled="controlsDisabled"
          :aria-invalid="visibleError('courseId') ? 'true' : undefined"
          :aria-describedby="visibleError('courseId') ? 'grade-course-message' : undefined"
          @change="values.courseId = selectId($event)"
          @blur="touched.courseId = true"
        >
          <option value="">Select Course</option>
          <option
            v-for="course in courses"
            :key="course.id"
            :value="course.id"
          >
            {{ course.code }} - {{ course.subject ?? 'Unnamed course' }}
          </option>
        </select>
        <p
          v-if="visibleError('courseId')"
          id="grade-course-message"
          class="grade-form__field-error"
        >
          {{ visibleError('courseId') }}
        </p>
      </div>

      <div v-else class="grade-form__field">
        <span id="grade-course-label" class="grade-form__label">
          Course <span class="grade-form__required">*</span>
        </span>
        <div
          id="grade-course"
          class="grade-form__readonly"
          tabindex="0"
          role="textbox"
          aria-readonly="true"
          aria-labelledby="grade-course-label"
          aria-describedby="grade-course-message"
        >
          {{ selectedCourse?.code ?? initialValues?.courseId }} - {{ selectedCourse?.subject ?? 'Unnamed course' }}
        </div>
        <p id="grade-course-message" class="grade-form__helper">
          Read-only. Course cannot be changed.
        </p>
      </div>

      <BaseInput
        id="grade-score"
        v-model="values.score"
        label="Grade"
        required
        helper="Enter the grade as text (e.g., A, B+, Pass, 8.5)."
        :disabled="controlsDisabled"
        :error="visibleError('score')"
        @blur="touched.score = true"
      />
    </div>

    <p v-if="submitError" class="grade-form__error" role="alert">
      {{ submitError }}
    </p>

    <div class="grade-form__actions">
      <BaseButton
        type="submit"
        :loading="pending"
        :disabled="controlsDisabled || isPristine"
      >
        <Save :size="17" aria-hidden="true" />
        {{ mode === 'edit' ? 'Update Grade' : 'Save Grade' }}
      </BaseButton>

      <BaseButton
        v-if="mode === 'edit'"
        type="button"
        variant="danger"
        :disabled="pending"
        @click="emit('delete')"
      >
        <Trash2 :size="17" aria-hidden="true" />
        Delete Grade
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
.grade-form {
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

  &__field {
    display: grid;
    min-width: 0;
    gap: 0.375rem;
  }

  &__label {
    color: var(--color-text-primary);
    font-size: 0.8125rem;
    font-weight: 500;
  }

  &__required,
  &__field-error,
  &__error {
    color: var(--color-danger);
  }

  &__select,
  &__readonly {
    width: 100%;
    min-width: 0;
    min-height: 36px;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-text-primary);
    font: inherit;
    font-size: 0.875rem;
    outline: none;
  }

  &__select {
    cursor: pointer;
    transition: border-color 150ms ease, box-shadow 150ms ease;

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

  &__readonly {
    display: block;
    overflow: hidden;
    background: var(--color-surface-muted);
    text-overflow: ellipsis;
    white-space: nowrap;

    &:focus {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgb(6 69 173 / 0.12);
    }
  }

  &__helper,
  &__field-error {
    margin: 0;
    font-size: 0.75rem;
  }

  &__helper {
    color: var(--color-text-secondary);
  }

  &__error {
    margin: 1rem 0 0;
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
  .grade-form {
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
