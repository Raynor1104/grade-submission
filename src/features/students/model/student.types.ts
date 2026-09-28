export interface StudentDto {
  id: number
  name: string
  birthDate: string
}

export interface StudentViewModel {
  id: number
  name: string
  birthDate: string
}

export interface StudentGradeACountDto {
  studentName: string
  gradeACount: number
}

export interface StudentGradeACountViewModel {
  studentName: string
  gradeACount: number
}

export interface CreateStudentInput {
  name: string
  birthDate: string
}

export type UpdateStudentInput = CreateStudentInput
