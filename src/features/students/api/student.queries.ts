import { queryOptions } from '@tanstack/vue-query'

import { studentKeys } from '@/core/api/query-keys'

import { getStudents } from './student.api'

export const studentQueries = {
  all: () => queryOptions({
    queryKey: studentKeys.all(),
    queryFn: ({ signal }) => getStudents(signal),
  }),
}
