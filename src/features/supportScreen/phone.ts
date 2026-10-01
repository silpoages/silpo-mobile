const COUNTRY_CODE = '55';
const MAX_TYPED_DIGITS = 11;

/**
 * Aplica a máscara `+55 DD 9XXXX-XXXX`, com código do país fixo.
 *
 * O `+55` volta no valor do campo a cada digitação, então só é descartado quando já está lá
 * (começa com `+`) ou quando o número colado passa do tamanho nacional. Fora isso, o `55`
 * digitado é o DDD de Santa Maria, RS, e os primeiros dígitos não podem ser engolidos.
 */
export function maskPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const hasCountryCode =
    digits.startsWith(COUNTRY_CODE) &&
    (raw.trim().startsWith('+') || digits.length > MAX_TYPED_DIGITS);
  const typed = (hasCountryCode ? digits.slice(COUNTRY_CODE.length) : digits).slice(
    0,
    MAX_TYPED_DIGITS,
  );

  if (!typed) {
    return '';
  }

  const ddd = typed.slice(0, 2);
  const firstPart = typed.slice(2, 7);
  const secondPart = typed.slice(7, 11);

  let masked = `+${COUNTRY_CODE}`;
  if (ddd) masked += ` ${ddd}`;
  if (firstPart) masked += ` ${firstPart}`;
  if (secondPart) masked += `-${secondPart}`;

  return masked;
}

/** Remove a máscara e devolve só os dígitos (com código do país) — formato que o backend espera. */
export function toRawPhone(masked: string): string {
  return masked.replace(/\D/g, '');
}
