import { httpClient } from '@/core/api/http-client'

import { mapGradeDto, mapGradeList } from '../model/grade.mapper'
import type { GradeInput, GradeViewModel } from '../model/grade.types'

function gradePairPath(studentId: number, courseId: number): string {
  return `/grade/student/${encodeURIComponent(String(studentId))}/course/${encodeURIComponent(String(courseId))}`
}

export async function getGrades(
  signal?: AbortSignal,
): Promise<GradeViewModel[]> {
  const response = await httpClient.get<unknown>('/grade/all', signal)

  return mapGradeList(response)
}

export async function getGrade(
  studentId: number,
  courseId: number,
  signal?: AbortSignal,
): Promise<GradeViewModel> {
  const response = await httpClient.get<unknown>(
    gradePairPath(studentId, courseId),
    signal,
  )

  return mapGradeDto(response)
}

export async function createGrade(
  studentId: number,
  courseId: number,
  input: GradeInput,
  signal?: AbortSignal,
): Promise<GradeViewModel> {
  const response = await httpClient.post<unknown>(
    gradePairPath(studentId, courseId),
    input,
    { signal },
  )

  return mapGradeDto(response)
}

export async function updateGrade(
  studentId: number,
  courseId: number,
  input: GradeInput,
  signal?: AbortSignal,
): Promise<GradeViewModel> {
  const response = await httpClient.put<unknown>(
    gradePairPath(studentId, courseId),
    input,
    signal,
  )

  return mapGradeDto(response)
}

export function deleteGrade(
  studentId: number,
  courseId: number,
  signal?: AbortSignal,
): Promise<void> {
  return httpClient.delete(gradePairPath(studentId, courseId), signal)
}
