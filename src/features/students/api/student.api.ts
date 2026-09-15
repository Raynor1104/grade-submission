import { httpClient } from '@/core/api/http-client'

import { mapStudentList } from '../model/student.mapper'
import type { StudentViewModel } from '../model/student.types'

export async function getStudents(
  signal?: AbortSignal,
): Promise<StudentViewModel[]> {
  const response = await httpClient.get<unknown>('/student/all', signal)

  return mapStudentList(response)
}

export function deleteStudent(
  id: number,
  signal?: AbortSignal,
): Promise<void> {
  return httpClient.delete(`/student/${encodeURIComponent(String(id))}`, signal)
}
