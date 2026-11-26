import { getModalHost } from '@test/sharedUiHelpers';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { BirthDateField } from '@/components/onboarding/BirthDateField';

jest.mock('@react-native-community/datetimepicker', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: (props: Record<string, unknown>) => <View testID="date-picker" {...props} />,
  };
});

const originalOS = Platform.OS;

function setPlatform(os: typeof Platform.OS) {
  Object.defineProperty(Platform, 'OS', { configurable: true, get: () => os });
}

afterEach(() => {
  setPlatform(originalOS);
});

describe('BirthDateField', () => {
  it('mascara o texto digitado e só emite data válida', async () => {
    const onChange = jest.fn();
    await render(<BirthDateField onChange={onChange} value={null} />);
    const input = screen.getByTestId('birth-date-field');

    await fireEvent.changeText(input, '1203');
    expect(input.props.value).toBe('12/03');
    expect(onChange).toHaveBeenLastCalledWith(null);

    await fireEvent.changeText(input, '12031990');
    expect(input.props.value).toBe('12/03/1990');
    expect(onChange).toHaveBeenLastCalledWith(new Date(1990, 2, 12));
  });

  it('exibe o valor inicial formatado e acompanha mudanças externas', async () => {
    const { rerender } = await render(
      <BirthDateField onChange={jest.fn()} value={new Date(2000, 0, 5)} />,
    );
    expect(screen.getByTestId('birth-date-field').props.value).toBe('05/01/2000');

    await rerender(<BirthDateField onChange={jest.fn()} value={null} />);
    expect(screen.getByTestId('birth-date-field').props.value).toBe('');
  });

  it('mostra a mensagem de erro', async () => {
    await render(<BirthDateField errorMessage="Obrigatório" onChange={jest.fn()} value={null} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Obrigatório');
  });

  describe('iOS', () => {
    beforeEach(() => setPlatform('ios'));

    it('abre o modal, troca o rascunho e confirma', async () => {
      const onChange = jest.fn();
      await render(<BirthDateField onChange={onChange} value={new Date(2000, 0, 5)} />);

      expect(screen.queryByText('Confirmar')).toBeNull();
      await fireEvent.press(screen.getByTestId('birth-date-calendar-button'));

      const picker = screen.getByTestId('date-picker');
      expect(picker.props.value).toEqual(new Date(2000, 0, 5));

      await fireEvent(picker, 'change', { type: 'set' }, undefined);
      await fireEvent(picker, 'change', { type: 'set' }, new Date(1995, 5, 20));
      await fireEvent.press(screen.getByText('Confirmar'));

      expect(onChange).toHaveBeenCalledWith(new Date(1995, 5, 20));
      expect(screen.queryByText('Confirmar')).toBeNull();
    });

    it('fecha pelo fundo sem alterar o valor', async () => {
      const onChange = jest.fn();
      await render(<BirthDateField onChange={onChange} value={null} />);

      await fireEvent.press(screen.getByTestId('birth-date-calendar-button'));
      await fireEvent.press(screen.getByLabelText('Fechar'));

      expect(screen.queryByText('Confirmar')).toBeNull();
      expect(onChange).not.toHaveBeenCalled();
    });

    it('fecha pelo onRequestClose do modal', async () => {
      await render(<BirthDateField onChange={jest.fn()} value={null} />);
      await fireEvent.press(screen.getByTestId('birth-date-calendar-button'));

      // O evento sobe até o Modal, que é quem trata o botão voltar do sistema.
      await fireEvent(getModalHost(), 'requestClose');

      expect(screen.queryByText('Confirmar')).toBeNull();
    });
  });

  describe('Android', () => {
    beforeEach(() => setPlatform('android'));

    it('emite a data escolhida e fecha o seletor', async () => {
      const onChange = jest.fn();
      await render(<BirthDateField onChange={onChange} value={null} />);

      expect(screen.queryByTestId('date-picker')).toBeNull();
      await fireEvent.press(screen.getByTestId('birth-date-calendar-button'));

      await fireEvent(
        screen.getByTestId('date-picker'),
        'change',
        { type: 'set' },
        new Date(1990, 1, 1),
      );

      expect(onChange).toHaveBeenCalledWith(new Date(1990, 1, 1));
      expect(screen.queryByTestId('date-picker')).toBeNull();
    });

    it('fecha sem emitir quando a pessoa cancela', async () => {
      const onChange = jest.fn();
      await render(<BirthDateField onChange={onChange} value={null} />);

      await fireEvent.press(screen.getByTestId('birth-date-calendar-button'));
      await fireEvent(
        screen.getByTestId('date-picker'),
        'change',
        { type: 'dismissed' },
        undefined,
      );

      expect(onChange).not.toHaveBeenCalled();
      expect(screen.queryByTestId('date-picker')).toBeNull();
    });
  });
});
