export const studentKeys = {
  root: ['students'] as const,
  all: () => ['students', 'all'] as const,
  detail: (id: number) => ['students', 'detail', id] as const,
}

export const courseKeys = {
  root: ['courses'] as const,
  all: () => ['courses', 'all'] as const,
  detail: (id: number) => ['courses', 'detail', id] as const,
}

export const gradeKeys = {
  root: ['grades'] as const,
  all: () => ['grades', 'all'] as const,
}
