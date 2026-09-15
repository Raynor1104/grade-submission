export function formatDisplayDate(
  value: string,
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return '—'
  }

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const monthLengths = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]
  const daysInMonth = monthLengths[month - 1]

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    daysInMonth === undefined ||
    day > daysInMonth
  ) {
    return '—'
  }

  return `${yearText}/${monthText}/${dayText}`
}
