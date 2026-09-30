export const studentKeys = {
  root: ['students'] as const,
  all: () => ['students', 'all'] as const,
  detail: (id: number) => ['students', 'detail', id] as const,
  gradeACounts: () => ['students', 'grade-a-counts'] as const,
}

export const courseKeys = {
  root: ['courses'] as const,
  all: () => ['courses', 'all'] as const,
  detail: (id: number) => ['courses', 'detail', id] as const,
}

export const gradeKeys = {
  root: ['grades'] as const,
  all: () => ['grades', 'all'] as const,
  byStudent: (studentId: number) => ['grades', 'student', studentId] as const,
  byCourse: (courseId: number) => ['grades', 'course', courseId] as const,
  pair: (studentId: number, courseId: number) => (
    ['grades', 'pair', studentId, courseId] as const
  ),
}
