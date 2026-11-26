import { fireEvent, render, screen } from '@testing-library/react-native';

import { ReminderTimeField } from '@/components/notificationsScreen/ReminderTimeField.web';

type PickerInput = {
  props: Record<string, any>;
  showPicker?: jest.Mock;
  focus?: jest.Mock;
};

/** O `<input type="time">` escondido — o ref dele é a própria instância do test renderer. */
function getNativeInput(): PickerInput {
  return screen.container.queryAll((node) => node.type === 'input')[0] as unknown as PickerInput;
}

describe('ReminderTimeField (web)', () => {
  it('mostra o horário e espelha no input nativo', async () => {
    await render(<ReminderTimeField onChange={jest.fn()} value={{ hour: 9, minute: 5 }} />);

    expect(screen.getByText('09:05')).toBeTruthy();
    expect(getNativeInput().props.value).toBe('09:05');
    expect(getNativeInput().props.type).toBe('time');
  });

  it('emite só horários válidos do input nativo', async () => {
    const onChange = jest.fn();
    await render(<ReminderTimeField onChange={onChange} value={{ hour: 9, minute: 5 }} />);

    getNativeInput().props.onChange({ target: { value: '' } });
    getNativeInput().props.onChange({ target: { value: 'xx:yy' } });
    expect(onChange).not.toHaveBeenCalled();

    getNativeInput().props.onChange({ target: { value: '21:45' } });
    expect(onChange).toHaveBeenCalledWith({ hour: 21, minute: 45 });
  });

  it('abre o seletor com showPicker quando disponível', async () => {
    await render(<ReminderTimeField onChange={jest.fn()} value={{ hour: 9, minute: 5 }} />);
    const input = getNativeInput();
    input.showPicker = jest.fn();
    input.focus = jest.fn();

    await fireEvent.press(screen.getByRole('button', { name: 'Horário do lembrete: 09:05' }));

    expect(input.showPicker).toHaveBeenCalled();
    expect(input.focus).not.toHaveBeenCalled();
  });

  it('foca o input quando não há showPicker', async () => {
    await render(<ReminderTimeField onChange={jest.fn()} value={{ hour: 9, minute: 5 }} />);
    const input = getNativeInput();
    input.focus = jest.fn();

    await fireEvent.press(screen.getByRole('button', { name: /Horário do lembrete/ }));

    expect(input.focus).toHaveBeenCalled();
  });

  it('fica desabilitado quando pedido', async () => {
    await render(
      <ReminderTimeField disabled onChange={jest.fn()} value={{ hour: 9, minute: 5 }} />,
    );
    expect(screen.getByRole('button', { name: /Horário do lembrete/ })).toBeDisabled();
  });
});
