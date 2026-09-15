import { httpClient } from '@/core/api/http-client'

import { mapCourseList } from '../model/course.mapper'
import type { CourseViewModel } from '../model/course.types'

export async function getCourses(
  signal?: AbortSignal,
): Promise<CourseViewModel[]> {
  const response = await httpClient.get<unknown>('/course/all', signal)

  return mapCourseList(response)
}
