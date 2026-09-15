export const studentKeys = {
  root: ['students'] as const,
  all: () => ['students', 'all'] as const,
  detail: (id: number) => ['students', 'detail', id] as const,
}

export const gradeKeys = {
  root: ['grades'] as const,
  all: () => ['grades', 'all'] as const,
}

export const dashboardKeys = {
  root: ['dashboard'] as const,
  summary: () => ['dashboard', 'summary'] as const,
}
