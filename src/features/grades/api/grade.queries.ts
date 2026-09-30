import {
  queryOptions,
  type QueryClient,
} from '@tanstack/vue-query'

import {
  courseKeys,
  gradeKeys,
  studentKeys,
} from '@/core/api/query-keys'

import { getGrade, getGrades } from './grade.api'

export const gradeQueries = {
  all: () => queryOptions({
    queryKey: gradeKeys.all(),
    queryFn: ({ signal }) => getGrades(signal),
  }),
  pair: (studentId: number, courseId: number) => queryOptions({
    queryKey: gradeKeys.pair(studentId, courseId),
    queryFn: ({ signal }) => getGrade(studentId, courseId, signal),
    retry: false,
  }),
}

export async function invalidateGradeDependencies(
  queryClient: QueryClient,
  studentId: number,
  courseId: number,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: gradeKeys.root,
      refetchType: 'none',
    }),
    queryClient.invalidateQueries({
      queryKey: studentKeys.detail(studentId),
      refetchType: 'none',
    }),
    queryClient.invalidateQueries({
      queryKey: courseKeys.detail(courseId),
      refetchType: 'none',
    }),
    queryClient.invalidateQueries({
      queryKey: studentKeys.gradeACounts(),
      refetchType: 'none',
    }),
  ])
}
