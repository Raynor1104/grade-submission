import { httpClient } from '@/core/api/http-client'

import {
  mapStudentDto,
  mapStudentGradeACountList,
  mapStudentList,
} from '../model/student.mapper'
import type {
  CreateStudentInput,
  StudentGradeACountViewModel,
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

export async function getStudentGradeACounts(
  signal?: AbortSignal,
): Promise<StudentGradeACountViewModel[]> {
  const response = await httpClient.get<unknown>(
    '/api/v1/students/grade-a-counts',
    signal,
  )

  return mapStudentGradeACountList(response)
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
