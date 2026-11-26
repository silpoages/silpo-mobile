import {
  formatBirthDate,
  maskBirthDateInput,
  parseBirthDateInput,
  toISODate,
} from '@/features/onboarding/date';

describe('toISODate', () => {
  it('formata como AAAA-MM-DD com zero à esquerda', () => {
    expect(toISODate(new Date(2001, 0, 5))).toBe('2001-01-05');
    expect(toISODate(new Date(1999, 11, 31))).toBe('1999-12-31');
  });
});

describe('formatBirthDate', () => {
  it('formata como DD/MM/AAAA', () => {
    expect(formatBirthDate(new Date(2001, 0, 5))).toBe('05/01/2001');
  });
});

describe('maskBirthDateInput', () => {
  it.each([
    ['', ''],
    ['1', '1'],
    ['12', '12'],
    ['123', '12/3'],
    ['1203', '12/03'],
    ['12031', '12/03/1'],
    ['12031990', '12/03/1990'],
    ['12/03/1990999', '12/03/1990'],
    ['ab12-03x1990', '12/03/1990'],
  ])('mascara %p como %p', (raw, expected) => {
    expect(maskBirthDateInput(raw)).toBe(expected);
  });
});

describe('parseBirthDateInput', () => {
  it('devolve a data quando completa e válida', () => {
    const parsed = parseBirthDateInput('29/02/2000');
    expect(parsed).toEqual(new Date(2000, 1, 29));
  });

  it.each(['', '12/03', '12/03/19', '1/3/1990', 'aa/bb/cccc'])(
    'devolve null para entrada incompleta %p',
    (input) => {
      expect(parseBirthDateInput(input)).toBeNull();
    },
  );

  it.each(['31/02/2001', '29/02/2001', '00/01/2000', '15/13/2000', '32/01/2000'])(
    'devolve null para data inexistente %p',
    (input) => {
      expect(parseBirthDateInput(input)).toBeNull();
    },
  );
});
