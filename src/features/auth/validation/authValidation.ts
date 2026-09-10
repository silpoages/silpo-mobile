/**
 * Formato de e-mail para barrar erro de digitação: algo, um arroba e um domínio
 * com partes não vazias separadas por ponto, terminando em pelo menos 2
 * caracteres (recusa `a@....cc`, `a@b..com` e `a@b.c`). Não prova que o e-mail
 * existe; isso é papel do backend.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;

/** Devolve a mensagem de erro do e-mail, ou `null` quando o valor é válido. */
export function validateEmail(email: string): string | null {
  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return 'O e-mail é obrigatório.';
  }

  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return 'Formato de e-mail inválido.';
  }

  return null;
}

/**
 * Devolve a mensagem de erro da senha, ou `null` quando o valor é válido.
 *
 * No login a senha só precisa estar preenchida: quem já tem conta não deve ser
 * barrado por uma regra de tamanho, que vale para a criação de senha.
 */
export function validatePassword(password: string): string | null {
  if (password.length === 0) {
    return 'A senha é obrigatória.';
  }

  return null;
}
