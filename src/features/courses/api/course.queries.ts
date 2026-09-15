import { queryOptions } from '@tanstack/vue-query'

import { courseKeys } from '@/core/api/query-keys'

import { getCourses } from './course.api'

export const courseQueries = {
  all: () => queryOptions({
    queryKey: courseKeys.all(),
    queryFn: ({ signal }) => getCourses(signal),
  }),
}
