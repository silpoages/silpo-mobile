import {
  WEEKDAY_INITIALS,
  addMonths,
  buildMonthWeeks,
  formatDayLabel,
  formatMonthTitle,
  getDefaultSelectedDate,
  getMonthOf,
  isSameDay,
  toDateKey,
} from '@/features/diaryScreen/calendar';

describe('calendar', () => {
  it('expõe as iniciais dos dias da semana começando no domingo', () => {
    expect(WEEKDAY_INITIALS).toEqual(['D', 'S', 'T', 'Q', 'Q', 'S', 'S']);
  });

  it('getMonthOf extrai ano e mês', () => {
    expect(getMonthOf(new Date(2026, 10, 25))).toEqual({ year: 2026, month: 10 });
  });

  it('addMonths atravessa a virada de ano nos dois sentidos', () => {
    expect(addMonths({ year: 2026, month: 11 }, 1)).toEqual({ year: 2027, month: 0 });
    expect(addMonths({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
  });

  it('formata título do mês e rótulo do dia', () => {
    expect(formatMonthTitle({ year: 2026, month: 2 })).toBe('Março 2026');
    expect(formatDayLabel(new Date(2026, 2, 7))).toBe('7 de março');
  });

  it('toDateKey usa AAAA-MM-DD com zero à esquerda', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('isSameDay ignora o horário', () => {
    expect(isSameDay(new Date(2026, 0, 5, 1), new Date(2026, 0, 5, 23))).toBe(true);
    expect(isSameDay(new Date(2026, 0, 5), new Date(2026, 0, 6))).toBe(false);
  });

  it('buildMonthWeeks preenche o início e o fim da grade com null', () => {
    // Novembro/2026 começa num domingo e tem 30 dias.
    const weeks = buildMonthWeeks({ year: 2026, month: 10 });
    expect(weeks).toHaveLength(5);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
    expect(weeks[0][0]?.getDate()).toBe(1);
    expect(weeks[4].slice(2)).toEqual([null, null, null, null, null]);

    // Janeiro/2026 começa numa quinta: 4 células vazias antes do dia 1.
    const january = buildMonthWeeks({ year: 2026, month: 0 });
    expect(january[0].slice(0, 4)).toEqual([null, null, null, null]);
    expect(january[0][4]?.getDate()).toBe(1);
  });

  it('getDefaultSelectedDate usa hoje no mês corrente e o dia 1 nos outros', () => {
    const today = new Date(2026, 10, 25);
    expect(getDefaultSelectedDate({ year: 2026, month: 10 }, today)).toBe(today);
    expect(getDefaultSelectedDate({ year: 2026, month: 9 }, today)).toEqual(new Date(2026, 9, 1));
  });

  it('getDefaultSelectedDate usa a data atual por padrão', () => {
    const now = new Date();
    const selected = getDefaultSelectedDate(getMonthOf(now));
    expect(isSameDay(selected, now)).toBe(true);
  });
});
