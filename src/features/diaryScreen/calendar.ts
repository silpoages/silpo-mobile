export type CalendarMonth = {
  year: number;
  month: number;
};

export const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const DAYS_IN_WEEK = 7;

export function getMonthOf(date: Date): CalendarMonth {
  return { year: date.getFullYear(), month: date.getMonth() };
}

export function addMonths(calendarMonth: CalendarMonth, amount: number): CalendarMonth {
  return getMonthOf(new Date(calendarMonth.year, calendarMonth.month + amount, 1));
}

export function formatMonthTitle({ year, month }: CalendarMonth): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export function formatDayLabel(date: Date): string {
  return `${date.getDate()} de ${MONTH_NAMES[date.getMonth()].toLowerCase()}`;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isSameDay(first: Date, second: Date): boolean {
  return toDateKey(first) === toDateKey(second);
}

export function buildMonthWeeks({ year, month }: CalendarMonth): (Date | null)[][] {
  const firstWeekday = new Date(year, month, 1).getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % DAYS_IN_WEEK !== 0) {
    cells.push(null);
  }

  const weeks: (Date | null)[][] = [];
  for (let index = 0; index < cells.length; index += DAYS_IN_WEEK) {
    weeks.push(cells.slice(index, index + DAYS_IN_WEEK));
  }

  return weeks;
}

export function getDefaultSelectedDate(calendarMonth: CalendarMonth, today = new Date()): Date {
  const currentMonth = getMonthOf(today);
  const isCurrentMonth =
    currentMonth.year === calendarMonth.year && currentMonth.month === calendarMonth.month;

  return isCurrentMonth ? today : new Date(calendarMonth.year, calendarMonth.month, 1);
}
