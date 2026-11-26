import {
  validateEmail,
  validateNewPassword,
  validatePassword,
} from '@/features/auth/validation/authValidation';

describe('validateEmail', () => {
  it('exige o e-mail preenchido', () => {
    expect(validateEmail('')).toBe('O e-mail é obrigatório.');
    expect(validateEmail('   ')).toBe('O e-mail é obrigatório.');
  });

  it.each(['a@....cc', 'a@b..com', 'a@b.c', 'sem-arroba.com', 'a b@c.com', 'a@b'])(
    'recusa o formato inválido %s',
    (email) => {
      expect(validateEmail(email)).toBe('Formato de e-mail inválido.');
    },
  );

  it.each(['ana@silpo.com', '  ana@silpo.com.br  ', 'a.b+c@sub.dominio.org'])(
    'aceita %s',
    (email) => {
      expect(validateEmail(email)).toBeNull();
    },
  );
});

describe('validatePassword', () => {
  it('só exige a senha preenchida', () => {
    expect(validatePassword('')).toBe('A senha é obrigatória.');
    expect(validatePassword('1')).toBeNull();
  });
});

describe('validateNewPassword', () => {
  it('exige a senha preenchida', () => {
    expect(validateNewPassword('')).toBe('A senha é obrigatória.');
  });

  it('exige pelo menos 8 caracteres', () => {
    expect(validateNewPassword('1234567')).toBe('A senha deve ter pelo menos 8 caracteres.');
    expect(validateNewPassword('12345678')).toBeNull();
  });
});
