import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  clampPage,
  filterStudents,
  getTotalPages,
  normalizeStudentSearch,
  paginateStudents,
  parseStudentPage,
} from '@/features/students/model/student-list'
import type { StudentViewModel } from '@/features/students/model/student.types'

const students: StudentViewModel[] = Array.from(
  { length: 12 },
  (_, index) => ({
    id: index + 1,
    name: index === 0 ? 'Nguyễn Văn An' : `Student ${index + 1}`,
    birthDate: '2000-01-01',
  }),
)

describe('student list helpers', () => {
  it('normalizes whitespace and casing', () => {
    expect(normalizeStudentSearch('  NGUYỄN  ')).toBe('nguyễn')
  })

  it('filters by case-insensitive name and ID substring', () => {
    expect(filterStudents(students, 'NGUYỄN')).toEqual([students[0]])
    expect(filterStudents(students, '12')).toEqual([students[11]])
  })

  it('treats whitespace-only search as no filter', () => {
    expect(filterStudents(students, '   ')).toBe(students)
  })

  it('paginates after filtering', () => {
    expect(getTotalPages(12)).toBe(2)
    expect(paginateStudents(students, 1)).toHaveLength(10)
    expect(paginateStudents(students, 2)).toEqual(students.slice(10))
  })

  it('normalizes and clamps invalid pages', () => {
    expect(parseStudentPage('invalid')).toBe(1)
    expect(parseStudentPage('-2')).toBe(1)
    expect(parseStudentPage(['3'])).toBe(3)
    expect(clampPage(4, 2)).toBe(2)
    expect(clampPage(Number.NaN, 2)).toBe(1)
  })
})
