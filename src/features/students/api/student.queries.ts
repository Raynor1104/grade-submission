import { queryOptions } from '@tanstack/vue-query'

import { studentKeys } from '@/core/api/query-keys'

import { getStudent, getStudents } from './student.api'

export const studentQueries = {
  all: () => queryOptions({
    queryKey: studentKeys.all(),
    queryFn: ({ signal }) => getStudents(signal),
  }),
  detail: (id: number) => queryOptions({
    queryKey: studentKeys.detail(id),
    queryFn: ({ signal }) => getStudent(id, signal),
    retry: false,
  }),
}
