import {
  describe,
  expect,
  it,
} from 'vitest'

import { ApiRequestError } from '@/core/api/types'
import {
  mapStudentDto,
  mapStudentGradeACountList,
  mapStudentList,
} from '@/features/students/model/student.mapper'
import { formatDisplayDate } from '@/shared/utils/date'

describe('student mapper', () => {
  it('maps required backend fields without changing values', () => {
    const dto = {
      id: 7,
      name: 'Nguyen Van A',
      birthDate: '1980-07-31',
      ignored: true,
    }

    expect(mapStudentDto(dto)).toEqual({
      id: 7,
      name: 'Nguyen Van A',
      birthDate: '1980-07-31',
    })
  })

  it('rejects invalid list and required fields as client errors', () => {
    expect(() => mapStudentList({})).toThrow(ApiRequestError)
    expect(() => mapStudentDto({
      id: 0,
      name: 'Invalid',
      birthDate: '2000-01-01',
    })).toThrow('Student data is missing required fields.')
  })

  it('maps valid student A-grade counts without merging duplicate names', () => {
    expect(mapStudentGradeACountList([
      { studentName: 'Alex', gradeACount: 4 },
      { studentName: 'Alex', gradeACount: 0 },
    ])).toEqual([
      { studentName: 'Alex', gradeACount: 4 },
      { studentName: 'Alex', gradeACount: 0 },
    ])
  })

  it.each([
    {},
    [{ gradeACount: 1 }],
    [{ studentName: null, gradeACount: 1 }],
    [{ studentName: 'A', gradeACount: '1' }],
    [{ studentName: 'A', gradeACount: 1.5 }],
    [{ studentName: 'A', gradeACount: -1 }],
    [{ studentName: 'A', gradeACount: Number.NaN }],
    [{ studentName: 'A', gradeACount: Number.POSITIVE_INFINITY }],
  ])('rejects invalid student A-grade count payload %#', (payload) => {
    expect(() => mapStudentGradeACountList(payload)).toThrow(ApiRequestError)
  })
})

describe('formatDisplayDate', () => {
  it('formats a valid date-only value without timezone conversion', () => {
    expect(formatDisplayDate('1980-07-31')).toBe('1980/07/31')
    expect(formatDisplayDate('2000-02-29')).toBe('2000/02/29')
  })

  it('returns a safe fallback for malformed calendar dates', () => {
    expect(formatDisplayDate('not-a-date')).toBe('—')
    expect(formatDisplayDate('2025-02-29')).toBe('—')
    expect(formatDisplayDate('2025-13-01')).toBe('—')
  })
})
