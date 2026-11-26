import { getModalHost } from '@test/sharedUiHelpers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { ReminderTimeField } from '@/components/notificationsScreen/ReminderTimeField';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => <View testID="time-picker" {...props} />,
  };
});

const originalOS = Platform.OS;

function setPlatform(os: typeof Platform.OS) {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

function at(hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

afterEach(() => setPlatform(originalOS));

describe('ReminderTimeField', () => {
  it('mostra o horário formatado com rótulo acessível', async () => {
    await render(<ReminderTimeField onChange={jest.fn()} value={{ hour: 8, minute: 5 }} />);

    expect(screen.getByText('08:05')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Horário do lembrete: 08:05' })).toBeTruthy();
  });

  it('não abre o seletor quando desabilitado', async () => {
    setPlatform('android');
    await render(
      <ReminderTimeField disabled onChange={jest.fn()} value={{ hour: 8, minute: 0 }} />,
    );

    const row = screen.getByRole('button', { name: /Horário do lembrete/ });
    expect(row).toBeDisabled();
    await fireEvent.press(row);
    expect(screen.queryByTestId('time-picker')).toBeNull();
  });

  describe('iOS', () => {
    beforeEach(() => setPlatform('ios'));

    it('abre o modal com o horário atual e confirma o rascunho', async () => {
      const onChange = jest.fn();
      await render(<ReminderTimeField onChange={onChange} value={{ hour: 20, minute: 0 }} />);

      expect(screen.queryByText('Confirmar')).toBeNull();
      await fireEvent.press(screen.getByRole('button', { name: /Horário do lembrete/ }));

      const picker = screen.getByTestId('time-picker');
      expect(picker.props.value).toEqual(at(20, 0));

      await fireEvent(picker, 'change', { type: 'set' }, undefined);
      await fireEvent(picker, 'change', { type: 'set' }, at(7, 45));
      await fireEvent.press(screen.getByText('Confirmar'));

      expect(onChange).toHaveBeenCalledWith({ hour: 7, minute: 45 });
      expect(screen.queryByText('Confirmar')).toBeNull();
    });

    it('fecha pelo fundo ou pelo voltar do sistema sem emitir', async () => {
      const onChange = jest.fn();
      await render(<ReminderTimeField onChange={onChange} value={{ hour: 20, minute: 0 }} />);
      const row = screen.getByRole('button', { name: /Horário do lembrete/ });

      await fireEvent.press(row);
      await fireEvent.press(screen.getByLabelText('Fechar'));
      expect(screen.queryByText('Confirmar')).toBeNull();

      await fireEvent.press(row);
      await fireEvent(getModalHost(), 'requestClose');
      expect(screen.queryByText('Confirmar')).toBeNull();

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Android', () => {
    beforeEach(() => setPlatform('android'));

    it('emite o horário escolhido e fecha', async () => {
      const onChange = jest.fn();
      await render(<ReminderTimeField onChange={onChange} value={{ hour: 20, minute: 0 }} />);

      await fireEvent.press(screen.getByRole('button', { name: /Horário do lembrete/ }));
      await fireEvent(screen.getByTestId('time-picker'), 'change', { type: 'set' }, at(6, 30));

      expect(onChange).toHaveBeenCalledWith({ hour: 6, minute: 30 });
      expect(screen.queryByTestId('time-picker')).toBeNull();
    });

    it('fecha sem emitir quando cancelado', async () => {
      const onChange = jest.fn();
      await render(<ReminderTimeField onChange={onChange} value={{ hour: 20, minute: 0 }} />);

      await fireEvent.press(screen.getByRole('button', { name: /Horário do lembrete/ }));
      await fireEvent(screen.getByTestId('time-picker'), 'change', { type: 'dismissed' });

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByTestId('time-picker')).toBeNull();
    });
  });
});
