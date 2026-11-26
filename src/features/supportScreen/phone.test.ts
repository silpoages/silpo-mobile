import { maskPhoneInput, toRawPhone } from '@/features/supportScreen/phone';

describe('maskPhoneInput', () => {
  it('retorna vazio quando não há dígitos', () => {
    expect(maskPhoneInput('')).toBe('');
    expect(maskPhoneInput('abc')).toBe('');
    expect(maskPhoneInput('+55')).toBe('');
  });

  it('aplica a máscara progressivamente', () => {
    expect(maskPhoneInput('5')).toBe('+55 5');
    expect(maskPhoneInput('51')).toBe('+55 51');
    expect(maskPhoneInput('51999')).toBe('+55 51 999');
    expect(maskPhoneInput('5199999')).toBe('+55 51 99999');
    expect(maskPhoneInput('51999998888')).toBe('+55 51 99999-8888');
  });

  it('mantém o 55 digitado como DDD quando não há "+" nem excesso de dígitos', () => {
    expect(maskPhoneInput('55999998888')).toBe('+55 55 99999-8888');
  });

  it('descarta o código do país quando o valor já começa com "+"', () => {
    expect(maskPhoneInput('+55 51 99999-8888')).toBe('+55 51 99999-8888');
    expect(maskPhoneInput('+55 51')).toBe('+55 51');
  });

  it('descarta o código do país quando o número colado passa do tamanho nacional', () => {
    expect(maskPhoneInput('5551999998888')).toBe('+55 51 99999-8888');
  });

  it('limita a 11 dígitos nacionais', () => {
    expect(maskPhoneInput('519999988887777')).toBe('+55 51 99999-8888');
  });
});

describe('toRawPhone', () => {
  it('remove tudo que não é dígito', () => {
    expect(toRawPhone('+55 51 99999-8888')).toBe('5551999998888');
  });
});
