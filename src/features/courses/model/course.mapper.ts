import { createClientError } from '@/core/api/types'

import type {
  CourseDto,
  CourseViewModel,
} from './course.types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function mapCourseDto(value: unknown): CourseViewModel {
  if (!isRecord(value)) {
    throw createClientError('Course data has an invalid shape.', value)
  }

  const dto = value as Partial<CourseDto>

  if (
    !Number.isInteger(dto.id) ||
    Number(dto.id) <= 0 ||
    typeof dto.code !== 'string' ||
    typeof dto.subject !== 'string' ||
    typeof dto.description !== 'string'
  ) {
    throw createClientError('Course data is missing required fields.', value)
  }

  return {
    id: dto.id as number,
    code: dto.code,
    subject: dto.subject,
    description: dto.description,
  }
}

export function mapCourseList(value: unknown): CourseViewModel[] {
  if (!Array.isArray(value)) {
    throw createClientError('Course list response must be an array.', value)
  }

  return value.map(mapCourseDto)
}
