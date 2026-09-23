export type StudentFormMode = 'create' | 'edit'

export interface StudentFormValues {
  name: string
  birthDate: string
}

export type StudentFormErrors = Partial<Record<keyof StudentFormValues, string>>

export const EMPTY_STUDENT_FORM: StudentFormValues = {
  name: '',
  birthDate: '',
}

export function normalizeStudentForm(values: StudentFormValues): StudentFormValues {
  return {
    name: values.name.trim(),
    birthDate: values.birthDate,
  }
}

export function isValidCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1 || month < 1 || month > 12) return false

  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return day >= 1 && day <= (days[month - 1] ?? 0)
}

export function localDateToday(now = new Date()): string {
  const year = String(now.getFullYear()).padStart(4, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function validateStudentForm(
  values: StudentFormValues,
  today = localDateToday(),
): StudentFormErrors {
  const normalized = normalizeStudentForm(values)
  const errors: StudentFormErrors = {}

  if (!normalized.name) errors.name = 'Full Name is required.'

  if (!normalized.birthDate) {
    errors.birthDate = 'Birth Date is required.'
  } else if (!isValidCalendarDate(normalized.birthDate)) {
    errors.birthDate = 'Enter a valid Birth Date.'
  } else if (normalized.birthDate > today) {
    errors.birthDate = 'Birth Date cannot be in the future.'
  }

  return errors
}
