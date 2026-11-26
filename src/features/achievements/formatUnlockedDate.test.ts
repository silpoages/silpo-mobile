import { formatUnlockedDate } from './formatUnlockedDate';

describe('formatUnlockedDate', () => {
  it('formata como dd/mm/aaaa com zeros à esquerda', () => {
    // Meio-dia evita que o fuso do aparelho mude o dia.
    expect(formatUnlockedDate('2026-03-05T12:00:00')).toBe('05/03/2026');
  });

  it('mantém dia e mês com dois dígitos', () => {
    expect(formatUnlockedDate('2025-12-31T12:00:00')).toBe('31/12/2025');
  });
});
