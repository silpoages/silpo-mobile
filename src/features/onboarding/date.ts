/** Converte para o formato ISO `AAAA-MM-DD` que o backend espera (`date` do Pydantic). */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/** Formata para exibição no padrão brasileiro `DD/MM/AAAA`. */
export function formatBirthDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/** Aplica a máscara `DD/MM/AAAA` a cada tecla digitada, ignorando o que não for dígito. */
export function maskBirthDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  let masked = day;
  if (month) {
    masked += `/${month}`;
  }
  if (year) {
    masked += `/${year}`;
  }

  return masked;
}

/** `null` se incompleto ou inválido — não deixa `31/02` virar 03/03 por rollover do `Date`. */
export function parseBirthDateInput(masked: string): Date | null {
  const match = masked.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, dayStr, monthStr, yearStr] = match;
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  const date = new Date(year, month - 1, day);

  const isRealDate =
    date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;

  return isRealDate ? date : null;
}
