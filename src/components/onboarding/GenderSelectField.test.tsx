import { getModalHost } from '@test/sharedUiHelpers';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { GenderSelectField } from '@/components/onboarding/GenderSelectField';

describe('GenderSelectField', () => {
  it('mostra o placeholder quando não há seleção', async () => {
    await render(<GenderSelectField onChange={jest.fn()} value={null} />);
    expect(screen.getByTestId('gender-field')).toHaveTextContent(/^Seu gênero/);
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('mostra o rótulo da opção selecionada', async () => {
    await render(<GenderSelectField onChange={jest.fn()} value="NON_BINARY" />);
    expect(screen.getByTestId('gender-field')).toHaveTextContent(/^Não-binário/);
  });

  it('abre as opções, marca a atual e emite a escolha', async () => {
    const onChange = jest.fn();
    await render(<GenderSelectField onChange={onChange} value="FEMALE" />);

    await fireEvent.press(screen.getByTestId('gender-field'));

    const options = screen.getAllByRole('radio');
    expect(options).toHaveLength(5);
    expect(screen.getByRole('radio', { name: 'Mulher' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Homem' })).not.toBeChecked();

    await fireEvent.press(screen.getByRole('radio', { name: 'Outro' }));

    expect(onChange).toHaveBeenCalledWith('OTHER');
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('fecha pelo fundo e pelo botão voltar do sistema', async () => {
    const onChange = jest.fn();
    await render(<GenderSelectField onChange={onChange} value={null} />);

    await fireEvent.press(screen.getByTestId('gender-field'));
    await fireEvent.press(screen.getByLabelText('Fechar'));
    expect(screen.queryByRole('radio')).toBeNull();

    await fireEvent.press(screen.getByTestId('gender-field'));
    await fireEvent(getModalHost(), 'requestClose');
    expect(screen.queryByRole('radio')).toBeNull();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('mostra a mensagem de erro', async () => {
    await render(<GenderSelectField errorMessage="Escolha um" onChange={jest.fn()} value={null} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha um');
  });
});
