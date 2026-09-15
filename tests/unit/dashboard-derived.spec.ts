import {
  describe,
  expect,
  it,
} from 'vitest'

import {
  getCourseGradeCounts,
  getCoursesWithoutGrades,
  getDashboardAttention,
  getDashboardSummary,
  getGradePreview,
  getStudentsWithoutGrades,
} from '@/features/dashboard/model/dashboard.derived'
import type { CourseViewModel } from '@/features/courses/model/course.types'
import type { GradeViewModel } from '@/features/grades/model/grade.types'
import type { StudentViewModel } from '@/features/students/model/student.types'

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

  it('ranks grade record counts, resolves ties by code, includes zeroes, and limits rows', () => {
    const courseSnapshot = structuredClone(courses)
    const gradeSnapshot = structuredClone(grades)
    const rows = getCourseGradeCounts(courses, grades)

    expect(rows.map(row => [row.courseCode, row.gradeCount])).toEqual([
      ['TOP', 2],
      ['ALPHA', 1],
      ['BETA', 1],
      ['EXTRA', 0],
      ['LAST', 0],
    ])
    expect(rows.map(row => row.barPercent)).toEqual([100, 50, 50, 0, 0])
    expect(courses).toEqual(courseSnapshot)
    expect(grades).toEqual(gradeSnapshot)
  })

  it('returns zero-width bars when every course has zero grade records', () => {
    expect(getCourseGradeCounts(courses.slice(0, 2), []))
      .toEqual([
        {
          courseId: 300,
          courseCode: 'BETA',
          courseName: 'Beta',
          gradeCount: 0,
          barPercent: 0,
        },
        {
          courseId: 700,
          courseCode: 'ZERO',
          courseName: 'Zero',
          gradeCount: 0,
          barPercent: 0,
        },
      ])
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
