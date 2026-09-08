/** Padrão mínimo de e-mail: algo, arroba, domínio com ponto. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Tamanho mínimo de senha anunciado no campo das telas de autenticação. */
export const PASSWORD_MIN_LENGTH = 8;

/** Devolve a mensagem de erro do e-mail, ou `null` quando o valor é válido. */
export function validateEmail(email: string): string | null {
  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return 'Informe seu e-mail.';
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return 'Digite um e-mail válido.';
  }

  return null;
}

/** Devolve a mensagem de erro da senha, ou `null` quando o valor é válido. */
export function validatePassword(password: string): string | null {
  if (password.length === 0) {
    return 'Informe sua senha.';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `A senha precisa de pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`;
  }

  return null;
}

/**
 * Valida só a presença da senha.
 *
 * Usada no login: quem já tem conta não deve ser barrado por uma regra de
 * tamanho que vale para a criação de senha.
 */
export function validateRequiredPassword(password: string): string | null {
  if (password.length === 0) {
    return 'Informe sua senha.';
  }

  return null;
}
