import { formatDiaryDate } from '@/features/diary/diaryDate';

describe('formatDiaryDate', () => {
  it('formata dia da semana, dia e mês por extenso', () => {
    expect(formatDiaryDate(new Date(2026, 10, 25))).toBe('Quarta, 25 de novembro');
  });

  it('cobre domingo e janeiro', () => {
    expect(formatDiaryDate(new Date(2026, 0, 4))).toBe('Domingo, 4 de janeiro');
  });
});
