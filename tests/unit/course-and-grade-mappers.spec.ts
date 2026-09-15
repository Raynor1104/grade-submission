import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  mapCourseDto,
  mapCourseList,
} from '@/features/courses/model/course.mapper'
import {
  mapGradeDto,
  mapGradeList,
} from '@/features/grades/model/grade.mapper'

describe('Course mapper', () => {
  it('maps the backend Course DTO without renaming or inventing data', () => {
    expect(mapCourseDto({
      id: 17,
      code: 'SWT301',
      subject: 'Software Testing',
      description: 'Test engineering',
    })).toEqual({
      id: 17,
      code: 'SWT301',
      subject: 'Software Testing',
      description: 'Test engineering',
    })
  })

  it('rejects non-array and incomplete course payloads', () => {
    expect(() => mapCourseList({ items: [] })).toThrow(
      'Course list response must be an array.',
    )
    expect(() => mapCourseDto({
      id: 1,
      code: 'SWT301',
      subject: 'Software Testing',
    })).toThrow('Course data is missing required fields.')
  })
})

describe('Grade mapper', () => {
  it.each(['A', 'B+', '8.5', 'Pass'])(
    'preserves the free-form score %s as a string',
    (score) => {
      expect(mapGradeDto({
        id: 3,
        score,
        student: { id: 11, name: 'Nguyen Van A' },
        course: {
          id: 27,
          code: 'JAVA101',
          subject: 'Java Programming',
        },
      })).toEqual({
        id: 3,
        score,
        student: { id: 11, name: 'Nguyen Van A' },
        course: {
          id: 27,
          code: 'JAVA101',
          subject: 'Java Programming',
        },
      })
    },
  )

  it('allows optional nested course presentation fields', () => {
    expect(mapGradeDto({
      id: 1,
      score: 'A',
      student: { id: 2, name: 'Student' },
      course: { id: 3, code: 'DBI202' },
    }).course).toEqual({ id: 3, code: 'DBI202' })
  })

  it('rejects malformed collections and missing nested identity fields', () => {
    expect(() => mapGradeList(null)).toThrow(
      'Grade list response must be an array.',
    )
    expect(() => mapGradeDto({
      id: 1,
      score: 'A',
      student: { id: 2, name: 'Student' },
      course: { id: 3 },
    })).toThrow('Grade course data is missing required fields.')
  })
})
