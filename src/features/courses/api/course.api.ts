import { httpClient } from '@/core/api/http-client'

import { mapCourseDto, mapCourseList } from '../model/course.mapper'
import type { CourseFormValues } from '../model/course-form'
import type { CourseViewModel } from '../model/course.types'

export async function getCourses(
  signal?: AbortSignal,
): Promise<CourseViewModel[]> {
  const response = await httpClient.get<unknown>('/course/all', signal)

  return mapCourseList(response)
}

export async function getCourse(
  id: number,
  signal?: AbortSignal,
): Promise<CourseViewModel> {
  const response = await httpClient.get<unknown>(
    `/course/${encodeURIComponent(String(id))}`,
    signal,
  )

  return mapCourseDto(response)
}

export async function createCourse(
  input: CourseFormValues,
): Promise<CourseViewModel> {
  const response = await httpClient.post<unknown>('/course', input)

  return mapCourseDto(response)
}

export async function updateCourse(
  id: number,
  input: CourseFormValues,
): Promise<CourseViewModel> {
  const response = await httpClient.put<unknown>(
    `/course/${encodeURIComponent(String(id))}`,
    input,
  )

  return mapCourseDto(response)
}

export function deleteCourse(
  id: number,
  signal?: AbortSignal,
): Promise<void> {
  return httpClient.delete(`/course/${encodeURIComponent(String(id))}`, signal)
}
