import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  getCoursesWithoutGrades,
  getDashboardAttention,
  getDashboardSummary,
  getGradePreview,
  getStudentGradeACountRows,
  getStudentsWithoutGrades,
} from '@/features/dashboard/model/dashboard.derived'
import type { CourseViewModel } from '@/features/courses/model/course.types'
import type { GradeViewModel } from '@/features/grades/model/grade.types'
import type {
  StudentGradeACountViewModel,
  StudentViewModel,
} from '@/features/students/model/student.types'

const students: StudentViewModel[] = [
  { id: 10, name: 'A', birthDate: '2000-01-01' },
  { id: 42, name: 'B', birthDate: '2000-02-02' },
  { id: 99, name: 'C', birthDate: '2000-03-03' },
]

const courses: CourseViewModel[] = [
  { id: 700, code: 'ZERO', subject: 'Zero', description: '' },
  { id: 300, code: 'BETA', subject: 'Beta', description: '' },
  { id: 200, code: 'ALPHA', subject: 'Alpha', description: '' },
  { id: 500, code: 'TOP', subject: 'Top', description: '' },
  { id: 600, code: 'EXTRA', subject: 'Extra', description: '' },
  { id: 800, code: 'LAST', subject: 'Last', description: '' },
]

const grades: GradeViewModel[] = [
  {
    id: 1,
    score: 'Pass',
    student: { id: 10, name: 'A' },
    course: { id: 500, code: 'TOP', subject: 'Top' },
  },
  {
    id: 2,
    score: '8.5',
    student: { id: 42, name: 'B' },
    course: { id: 500, code: 'TOP', subject: 'Top' },
  },
  {
    id: 3,
    score: 'B+',
    student: { id: 10, name: 'A' },
    course: { id: 300, code: 'BETA', subject: 'Beta' },
  },
  {
    id: 4,
    score: 'A',
    student: { id: 10, name: 'A' },
    course: { id: 200, code: 'ALPHA', subject: 'Alpha' },
  },
]

describe('dashboard derived values', () => {
  it('uses collection lengths for the three summary totals', () => {
    expect(getDashboardSummary(students, courses, grades)).toEqual({
      totalStudents: 3,
      totalCourses: 6,
      totalGrades: 4,
    })
    expect(getDashboardSummary([], [], [])).toEqual({
      totalStudents: 0,
      totalCourses: 0,
      totalGrades: 0,
    })
  })

  it('ranks student A-grade counts with deterministic ties and does not mutate input', () => {
    const counts: StudentGradeACountViewModel[] = [
      { studentName: 'Charlie', gradeACount: 3 },
      { studentName: 'Alex', gradeACount: 5 },
      { studentName: 'Zero', gradeACount: 0 },
      { studentName: 'Bob', gradeACount: 3 },
      { studentName: 'Alice', gradeACount: 3 },
      { studentName: 'Alex', gradeACount: 5 },
    ]
    const snapshot = structuredClone(counts)
    const rows = getStudentGradeACountRows(counts)

    expect(rows.map(row => [
      row.studentName,
      row.gradeACount,
      row.sourceIndex,
    ])).toEqual([
      ['Alex', 5, 1],
      ['Alex', 5, 5],
      ['Alice', 3, 4],
      ['Bob', 3, 3],
      ['Charlie', 3, 0],
    ])
    expect(rows.map(row => row.barPercent)).toEqual([100, 100, 60, 60, 60])
    expect(counts).toEqual(snapshot)
  })

  it('keeps zero-count students as rows and avoids division by zero', () => {
    expect(getStudentGradeACountRows([
      { studentName: 'B', gradeACount: 0 },
      { studentName: 'A', gradeACount: 0 },
    ])).toEqual([
      { studentName: 'A', gradeACount: 0, sourceIndex: 1, barPercent: 0 },
      { studentName: 'B', gradeACount: 0, sourceIndex: 0, barPercent: 0 },
    ])
    expect(getStudentGradeACountRows([], -1)).toEqual([])
  })

  it('counts parent entities whose IDs never appear in grades', () => {
    expect(getStudentsWithoutGrades(students, grades)).toBe(1)
    expect(getCoursesWithoutGrades(courses, grades)).toBe(3)
    expect(getDashboardAttention(students, courses, grades)).toEqual({
      studentsWithoutGrades: 1,
      coursesWithoutGrades: 3,
    })
  })

  it('does not treat orphan grade entities as parent records', () => {
    const orphan: GradeViewModel = {
      id: 100,
      score: 'A',
      student: { id: 123456, name: 'Orphan student' },
      course: { id: 654321, code: 'ORPHAN' },
    }
    const allGrades = [...grades, orphan]

    expect(getDashboardSummary(students, courses, allGrades)).toEqual({
      totalStudents: 3,
      totalCourses: 6,
      totalGrades: 5,
    })
    expect(getStudentsWithoutGrades(students, allGrades)).toBe(1)
    expect(getCoursesWithoutGrades(courses, allGrades)).toBe(3)
  })

  it('keeps canonical grade order, limit, and score strings in the preview', () => {
    const preview = getGradePreview([...grades, ...grades], 5)

    expect(preview).toHaveLength(5)
    expect(preview.map(grade => grade.id)).toEqual([1, 2, 3, 4, 1])
    expect(preview.map(grade => grade.score)).toEqual([
      'Pass',
      '8.5',
      'B+',
      'A',
      'Pass',
    ])
  })
})
