import type { StudentViewModel } from './student.types'

export const STUDENT_PAGE_SIZE = 10

export function normalizeStudentSearch(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function filterStudents(
  students: StudentViewModel[],
  search: string,
): StudentViewModel[] {
  const keyword = normalizeStudentSearch(search)

  if (!keyword) {
    return students
  }

  return students.filter(student => {
    return (
      student.name.toLocaleLowerCase().includes(keyword) ||
      String(student.id).includes(keyword)
    )
  })
}

export function getTotalPages(
  total: number,
  pageSize = STUDENT_PAGE_SIZE,
): number {
  return Math.max(1, Math.ceil(total / pageSize))
}

export function clampPage(page: number, totalPages: number): number {
  if (!Number.isInteger(page) || page < 1) {
    return 1
  }

  return Math.min(page, Math.max(1, totalPages))
}

export function parseStudentPage(value: unknown): number {
  const rawValue = Array.isArray(value) ? value[0] : value

  if (typeof rawValue !== 'string' || !/^\d+$/.test(rawValue)) {
    return 1
  }

  return clampPage(Number(rawValue), Number.MAX_SAFE_INTEGER)
}

export function paginateStudents(
  students: StudentViewModel[],
  page: number,
  pageSize = STUDENT_PAGE_SIZE,
): StudentViewModel[] {
  const safePage = clampPage(page, getTotalPages(students.length, pageSize))
  const start = (safePage - 1) * pageSize

  return students.slice(start, start + pageSize)
}
