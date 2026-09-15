import { createClientError } from '@/core/api/types'

import type {
  StudentDto,
  StudentViewModel,
} from './student.types'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function mapStudentDto(value: unknown): StudentViewModel {
  if (!isRecord(value)) {
    throw createClientError('Student data has an invalid shape.', value)
  }

  const dto = value as Partial<StudentDto>

  if (
    !Number.isInteger(dto.id) ||
    Number(dto.id) <= 0 ||
    typeof dto.name !== 'string' ||
    typeof dto.birthDate !== 'string'
  ) {
    throw createClientError('Student data is missing required fields.', value)
  }

  return {
    id: dto.id as number,
    name: dto.name,
    birthDate: dto.birthDate,
  }
}

export function mapStudentList(value: unknown): StudentViewModel[] {
  if (!Array.isArray(value)) {
    throw createClientError('Student list response must be an array.', value)
  }

  return value.map(mapStudentDto)
}
