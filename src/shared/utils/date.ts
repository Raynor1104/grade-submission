export function formatDisplayDate(
  value: string,
): string {
  return value.replaceAll('-', '/')
}