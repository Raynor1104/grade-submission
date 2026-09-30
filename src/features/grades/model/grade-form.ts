export type GradeFormMode = 'create' | 'edit'

export interface GradeFormValues {
  studentId: number | null
  courseId: number | null
  score: string
}

export type GradeFormErrors = Partial<Record<keyof GradeFormValues, string>>

export interface GradeFormValidationOptions {
  mode: GradeFormMode
  studentIds?: readonly number[]
  courseIds?: readonly number[]
}

export const EMPTY_GRADE_FORM: GradeFormValues = {
  studentId: null,
  courseId: null,
  score: '',
}

export function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
}

export function parsePositiveRouteId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null

  const parsed = Number(value)
  return isPositiveSafeInteger(parsed) ? parsed : null
}

export function normalizeGradeForm(values: GradeFormValues): GradeFormValues {
  return {
    studentId: values.studentId,
    courseId: values.courseId,
    score: values.score.trim(),
  }
}

export function validateGradeForm(
  values: GradeFormValues,
  options: GradeFormValidationOptions,
): GradeFormErrors {
  const normalized = normalizeGradeForm(values)
  const errors: GradeFormErrors = {}

  if (options.mode === 'create') {
    if (
      !isPositiveSafeInteger(normalized.studentId) ||
      !options.studentIds?.includes(normalized.studentId)
    ) {
      errors.studentId = 'Student is required.'
    }

    if (
      !isPositiveSafeInteger(normalized.courseId) ||
      !options.courseIds?.includes(normalized.courseId)
    ) {
      errors.courseId = 'Course is required.'
    }
  }

  if (!normalized.score) errors.score = 'Grade is required.'

  return errors
}
