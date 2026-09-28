import { queryOptions } from '@tanstack/vue-query'

import { courseKeys } from '@/core/api/query-keys'

import { getCourse, getCourses } from './course.api'

export const courseQueries = {
  all: () => queryOptions({
    queryKey: courseKeys.all(),
    queryFn: ({ signal }) => getCourses(signal),
  }),
  detail: (id: number) => queryOptions({
    queryKey: courseKeys.detail(id),
    queryFn: ({ signal }) => getCourse(id, signal),
    retry: false,
  }),
}
