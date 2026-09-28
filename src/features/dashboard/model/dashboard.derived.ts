import type { CourseViewModel } from '@/features/courses/model/course.types'
import type { GradeViewModel } from '@/features/grades/model/grade.types'
import type {
  StudentGradeACountViewModel,
  StudentViewModel,
} from '@/features/students/model/student.types'

import type {
  DashboardAttention,
  DashboardSummary,
  StudentGradeACountRow,
} from './dashboard.types'

export function getDashboardSummary(
  students: readonly StudentViewModel[],
  courses: readonly CourseViewModel[],
  grades: readonly GradeViewModel[],
): DashboardSummary {
  return {
    totalStudents: students.length,
    totalCourses: courses.length,
    totalGrades: grades.length,
  }
}

export function getStudentGradeACountRows(
  counts: readonly StudentGradeACountViewModel[],
  limit = 5,
): StudentGradeACountRow[] {
  const rankedStudents = counts
    .map((student, sourceIndex) => ({
      ...student,
      sourceIndex,
    }))
    .sort((left, right) => (
      right.gradeACount - left.gradeACount ||
      left.studentName.localeCompare(right.studentName) ||
      left.sourceIndex - right.sourceIndex
    ))
    .slice(0, Math.max(0, limit))

  const maxGradeACount = rankedStudents.reduce(
    (maximum, student) => Math.max(maximum, student.gradeACount),
    0,
  )

  return rankedStudents.map(student => ({
    ...student,
    barPercent: maxGradeACount === 0
      ? 0
      : (student.gradeACount / maxGradeACount) * 100,
  }))
}

export function getStudentsWithoutGrades(
  students: readonly StudentViewModel[],
  grades: readonly GradeViewModel[],
): number {
  const gradedStudentIds = new Set(
    grades.map(grade => grade.student.id),
  )

  return students.reduce(
    (count, student) => count + (gradedStudentIds.has(student.id) ? 0 : 1),
    0,
  )
}

export function getCoursesWithoutGrades(
  courses: readonly CourseViewModel[],
  grades: readonly GradeViewModel[],
): number {
  const gradedCourseIds = new Set(
    grades.map(grade => grade.course.id),
  )

  return courses.reduce(
    (count, course) => count + (gradedCourseIds.has(course.id) ? 0 : 1),
    0,
  )
}

export function getDashboardAttention(
  students: readonly StudentViewModel[],
  courses: readonly CourseViewModel[],
  grades: readonly GradeViewModel[],
): DashboardAttention {
  return {
    studentsWithoutGrades: getStudentsWithoutGrades(students, grades),
    coursesWithoutGrades: getCoursesWithoutGrades(courses, grades),
  }
}

export function getGradePreview(
  grades: readonly GradeViewModel[],
  limit = 5,
): GradeViewModel[] {
  return grades.slice(0, Math.max(0, limit))
}
