export type DashboardDataSource = 'students' | 'courses' | 'grades'

export interface DashboardSummary {
  totalStudents: number
  totalCourses: number
  totalGrades: number
}

export interface CourseGradeCount {
  courseId: number
  courseCode: string
  courseName: string
  gradeCount: number
  barPercent: number
}

export interface DashboardAttention {
  studentsWithoutGrades: number
  coursesWithoutGrades: number
}
