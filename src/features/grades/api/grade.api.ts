import { httpClient } from '@/core/api/http-client'

import { mapGradeList } from '../model/grade.mapper'
import type { GradeViewModel } from '../model/grade.types'

export async function getGrades(
  signal?: AbortSignal,
): Promise<GradeViewModel[]> {
  const response = await httpClient.get<unknown>('/grade/all', signal)

  return mapGradeList(response)
}
