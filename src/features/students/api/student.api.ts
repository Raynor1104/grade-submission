import { httpClient } from '@/core/api/http-client'

import { mapStudentDto, mapStudentList } from '../model/student.mapper'
import type {
  CreateStudentInput,
  StudentViewModel,
  UpdateStudentInput,
} from '../model/student.types'

export async function getStudents(
  signal?: AbortSignal,
): Promise<StudentViewModel[]> {
  const response = await httpClient.get<unknown>('/student/all', signal)

  return mapStudentList(response)
}

export async function getStudent(
  id: number,
  signal?: AbortSignal,
): Promise<StudentViewModel> {
  const response = await httpClient.get<unknown>(`/student/${id}`, signal)
  return mapStudentDto(response)
}

export function createStudent(input: CreateStudentInput): Promise<unknown> {
  return httpClient.post<unknown>('/student', input)
}

export async function updateStudent(
  id: number,
  input: UpdateStudentInput,
): Promise<StudentViewModel> {
  const response = await httpClient.put<unknown>(`/student/${id}`, input)
  return mapStudentDto(response)
}

export function deleteStudent(
  id: number,
  signal?: AbortSignal,
): Promise<void> {
  return httpClient.delete(`/student/${encodeURIComponent(String(id))}`, signal)
}
