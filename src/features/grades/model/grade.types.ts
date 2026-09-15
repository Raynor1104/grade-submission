export interface GradeStudent {
  id: number
  name: string
}

export interface GradeCourse {
  id: number
  code: string
  subject?: string
  description?: string
}

export interface GradeDto {
  id: number
  score: string
  student: GradeStudent
  course: GradeCourse
}

export interface GradeViewModel {
  id: number
  score: string
  student: GradeStudent
  course: GradeCourse
}
