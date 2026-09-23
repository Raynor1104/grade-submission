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

export interface CreateStudentInput {
  name: string
  birthDate: string
}

export type UpdateStudentInput = CreateStudentInput
