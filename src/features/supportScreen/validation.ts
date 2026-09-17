/** DDD (2 dígitos) + número (8 ou 9 dígitos, fixo ou celular). */
const PHONE_DIGITS_PATTERN = /^\d{10,11}$/;

/** Aceita `+55 51 99999-8888`, `(51) 99999-8888`, `51999998888`, etc. */
export function validatePhoneNumber(phone: string): string | null {
  const trimmed = phone.trim();

  if (trimmed.length === 0) {
    return 'O telefone é obrigatório.';
  }

  const digits = trimmed.replace(/\D/g, '').replace(/^55/, '');

  if (!PHONE_DIGITS_PATTERN.test(digits)) {
    return 'Formato de telefone inválido.';
  }

  return null;
}
