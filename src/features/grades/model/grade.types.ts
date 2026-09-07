export interface GradeStudent {
  id: number
  name: string
}

export interface GradeCourse {
  id: number
  code: string
  name: string
}

export interface GradeViewModel {
  id: number
  score: string
  student: GradeStudent
  course: GradeCourse
}
