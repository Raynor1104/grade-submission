import { queryOptions } from '@tanstack/vue-query'

import { gradeKeys } from '@/core/api/query-keys'

import { getGrades } from './grade.api'

export const gradeQueries = {
  all: () => queryOptions({
    queryKey: gradeKeys.all(),
    queryFn: ({ signal }) => getGrades(signal),
  }),
}
