import { createClientError } from '@/core/api/types'

import type {
  GradeCourse,
  GradeDto,
  GradeStudent,
  GradeViewModel,
} from './grade.types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function mapGradeStudent(value: unknown): GradeStudent {
  if (!isRecord(value)) {
    throw createClientError('Grade student data has an invalid shape.', value)
  }

  if (
    !Number.isInteger(value.id) ||
    Number(value.id) <= 0 ||
    typeof value.name !== 'string'
  ) {
    throw createClientError('Grade student data is missing required fields.', value)
  }

  return {
    id: value.id as number,
    name: value.name,
  }
}

function mapGradeCourse(value: unknown): GradeCourse {
  if (!isRecord(value)) {
    throw createClientError('Grade course data has an invalid shape.', value)
  }

  if (
    !Number.isInteger(value.id) ||
    Number(value.id) <= 0 ||
    typeof value.code !== 'string'
  ) {
    throw createClientError('Grade course data is missing required fields.', value)
  }

  if (value.subject !== undefined && typeof value.subject !== 'string') {
    throw createClientError('Grade course subject has an invalid shape.', value)
  }

  if (value.description !== undefined && typeof value.description !== 'string') {
    throw createClientError('Grade course description has an invalid shape.', value)
  }

  return {
    id: value.id as number,
    code: value.code,
    ...(typeof value.subject === 'string' ? { subject: value.subject } : {}),
    ...(typeof value.description === 'string'
      ? { description: value.description }
      : {}),
  }
}

export function mapGradeDto(value: unknown): GradeViewModel {
  if (!isRecord(value)) {
    throw createClientError('Grade data has an invalid shape.', value)
  }

  const dto = value as Partial<GradeDto>

  if (
    !Number.isInteger(dto.id) ||
    Number(dto.id) <= 0 ||
    typeof dto.score !== 'string'
  ) {
    throw createClientError('Grade data is missing required fields.', value)
  }

  return {
    id: dto.id as number,
    score: dto.score,
    student: mapGradeStudent(dto.student),
    course: mapGradeCourse(dto.course),
  }
}

export function mapGradeList(value: unknown): GradeViewModel[] {
  if (!Array.isArray(value)) {
    throw createClientError('Grade list response must be an array.', value)
  }

  return value.map(mapGradeDto)
}
