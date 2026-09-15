import type { CourseViewModel } from '@/features/courses/model/course.types'
import type { GradeViewModel } from '@/features/grades/model/grade.types'
import type { StudentViewModel } from '@/features/students/model/student.types'

import type {
  CourseGradeCount,
  DashboardAttention,
  DashboardSummary,
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

export function getCourseGradeCounts(
  courses: readonly CourseViewModel[],
  grades: readonly GradeViewModel[],
  limit = 5,
): CourseGradeCount[] {
  const countByCourseId = new Map<number, number>()

  for (const course of courses) {
    countByCourseId.set(course.id, 0)
  }

  for (const grade of grades) {
    const courseId = grade.course.id

    countByCourseId.set(
      courseId,
      (countByCourseId.get(courseId) ?? 0) + 1,
    )
  }

  const rankedCourses = courses
    .map(course => ({
      courseId: course.id,
      courseCode: course.code,
      courseName: course.subject,
      gradeCount: countByCourseId.get(course.id) ?? 0,
    }))
    .sort((left, right) => (
      right.gradeCount - left.gradeCount ||
      left.courseCode.localeCompare(right.courseCode)
    ))
    .slice(0, Math.max(0, limit))

  const maxGradeCount = rankedCourses.reduce(
    (maximum, course) => Math.max(maximum, course.gradeCount),
    0,
  )

  return rankedCourses.map(course => ({
    ...course,
    barPercent: maxGradeCount === 0
      ? 0
      : (course.gradeCount / maxGradeCount) * 100,
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
