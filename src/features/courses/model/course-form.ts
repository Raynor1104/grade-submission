export type CourseFormMode = 'create' | 'edit'

export interface CourseFormValues {
  code: string
  subject: string
  description: string
}

export type CourseFormErrors = Partial<Record<keyof CourseFormValues, string>>

export const EMPTY_COURSE_FORM: CourseFormValues = {
  code: '',
  subject: '',
  description: '',
}

export function normalizeCourseForm(values: CourseFormValues): CourseFormValues {
  return {
    code: values.code.trim(),
    subject: values.subject.trim(),
    description: values.description.trim(),
  }
}

export function validateCourseForm(values: CourseFormValues): CourseFormErrors {
  const normalized = normalizeCourseForm(values)
  const errors: CourseFormErrors = {}

  if (!normalized.code) errors.code = 'Course Code is required.'
  if (!normalized.subject) errors.subject = 'Course Name is required.'
  if (!normalized.description) errors.description = 'Description is required.'

  return errors
}
