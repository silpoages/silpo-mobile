import { validatePhoneNumber } from '@/features/supportScreen/validation';

describe('validatePhoneNumber', () => {
  it('exige telefone', () => {
    expect(validatePhoneNumber('')).toBe('O telefone é obrigatório.');
    expect(validatePhoneNumber('   ')).toBe('O telefone é obrigatório.');
  });

  it.each(['+55 51 99999-8888', '(51) 99999-8888', '51999998888', '5133334444'])(
    'aceita %s',
    (phone) => {
      expect(validatePhoneNumber(phone)).toBeNull();
    },
  );

  it.each(['123', '+55 51 9999', '519999988887777'])('rejeita %s', (phone) => {
    expect(validatePhoneNumber(phone)).toBe('Formato de telefone inválido.');
  });
});
