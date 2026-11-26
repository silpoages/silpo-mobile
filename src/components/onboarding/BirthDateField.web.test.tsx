import { fireEvent, render, screen } from '@testing-library/react-native';

import { BirthDateField } from '@/components/onboarding/BirthDateField.web';

type PickerInput = {
  props: Record<string, any>;
  showPicker?: jest.Mock;
  focus?: jest.Mock;
};

/** O `<input type="date">` escondido — o ref dele é a própria instância do test renderer. */
function getNativeInput(): PickerInput {
  return screen.container.queryAll((node) => node.type === 'input')[0] as unknown as PickerInput;
}

function changeNativeInput(value: string) {
  getNativeInput().props.onChange({ target: { value } });
}

describe('BirthDateField (web)', () => {
  it('mascara o texto digitado e emite a data quando completa', async () => {
    const onChange = jest.fn();
    await render(<BirthDateField onChange={onChange} value={null} />);
    const field = screen.getByTestId('birth-date-field');

    await fireEvent.changeText(field, '0102');
    expect(field.props.value).toBe('01/02');
    expect(onChange).toHaveBeenLastCalledWith(null);

    await fireEvent.changeText(field, '01022003');
    expect(onChange).toHaveBeenLastCalledWith(new Date(2003, 1, 1));
  });

  it('espelha o valor no input nativo e no campo de texto', async () => {
    const { rerender } = await render(
      <BirthDateField onChange={jest.fn()} value={new Date(1990, 4, 9)} />,
    );

    expect(screen.getByTestId('birth-date-field').props.value).toBe('09/05/1990');
    expect(getNativeInput().props.value).toBe('1990-05-09');
    expect(getNativeInput().props.max).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await rerender(<BirthDateField onChange={jest.fn()} value={null} />);
    expect(screen.getByTestId('birth-date-field').props.value).toBe('');
    expect(getNativeInput().props.value).toBe('');
  });

  it('converte a data escolhida no seletor do navegador', async () => {
    const onChange = jest.fn();
    await render(<BirthDateField onChange={onChange} value={null} />);

    changeNativeInput('');
    expect(onChange).not.toHaveBeenCalled();

    changeNativeInput('1988-12-25');
    expect(onChange).toHaveBeenCalledWith(new Date(1988, 11, 25));
  });

  it('abre o seletor com showPicker quando disponível', async () => {
    await render(<BirthDateField onChange={jest.fn()} value={null} />);
    const input = getNativeInput();
    input.showPicker = jest.fn();
    input.focus = jest.fn();

    await fireEvent.press(screen.getByTestId('birth-date-calendar-button'));

    expect(input.showPicker).toHaveBeenCalled();
    expect(input.focus).not.toHaveBeenCalled();
  });

  it('foca o input quando o navegador não tem showPicker', async () => {
    await render(<BirthDateField onChange={jest.fn()} value={null} />);
    const input = getNativeInput();
    input.focus = jest.fn();

    await fireEvent.press(screen.getByTestId('birth-date-calendar-button'));

    expect(input.focus).toHaveBeenCalled();
  });

  it('mostra a mensagem de erro', async () => {
    await render(<BirthDateField errorMessage="Data inválida" onChange={jest.fn()} value={null} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Data inválida');
  });
});
