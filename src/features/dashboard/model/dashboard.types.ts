export type DashboardDataSource = 'students' | 'courses' | 'grades'

export interface DashboardSummary {
  totalStudents: number
  totalCourses: number
  totalGrades: number
}

export interface StudentGradeACountRow {
  studentName: string
  gradeACount: number
  barPercent: number
  sourceIndex: number
}

export interface DashboardAttention {
  studentsWithoutGrades: number
  coursesWithoutGrades: number
}
