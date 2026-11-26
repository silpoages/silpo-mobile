import { getModalHost } from '@test/sharedUiHelpers';
import { fireEvent, render, screen } from '@testing-library/react-native';

import DeleteAccountModal from '@/features/profileScreen/DeleteAccountModal';

function getDeleteButton() {
  return screen.getByRole('button', { name: 'Excluir' });
}

describe('DeleteAccountModal', () => {
  it('não mostra nada quando fechado', async () => {
    await render(
      <DeleteAccountModal
        loading={false}
        onClose={jest.fn()}
        onConfirm={jest.fn()}
        visible={false}
      />,
    );
    expect(screen.queryByText('Excluir conta')).toBeNull();
  });

  it('só libera a exclusão depois de digitar "deletar" (sem diferenciar maiúsculas)', async () => {
    const onConfirm = jest.fn();
    await render(
      <DeleteAccountModal loading={false} onClose={jest.fn()} onConfirm={onConfirm} visible />,
    );

    expect(screen.getByText('Excluir conta')).toBeTruthy();
    expect(getDeleteButton()).toBeDisabled();

    await fireEvent.changeText(screen.getByPlaceholderText('deletar'), 'delet');
    expect(getDeleteButton()).toBeDisabled();

    await fireEvent.changeText(screen.getByPlaceholderText('deletar'), '  DELETAR ');
    expect(getDeleteButton()).not.toBeDisabled();

    await fireEvent.press(getDeleteButton());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('fecha por Cancelar, pelo fundo e pelo voltar do sistema', async () => {
    const onClose = jest.fn();
    await render(
      <DeleteAccountModal loading={false} onClose={onClose} onConfirm={jest.fn()} visible />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    await fireEvent(getModalHost(), 'requestClose');

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('bloqueia o fechamento e a edição enquanto exclui', async () => {
    const onClose = jest.fn();
    await render(<DeleteAccountModal loading onClose={onClose} onConfirm={jest.fn()} visible />);

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByPlaceholderText('deletar').props.editable).toBe(false);

    await fireEvent(getModalHost(), 'requestClose');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('limpa o texto digitado ao fechar', async () => {
    const props = { loading: false, onClose: jest.fn(), onConfirm: jest.fn() };
    const { rerender } = await render(<DeleteAccountModal {...props} visible />);

    await fireEvent.changeText(screen.getByPlaceholderText('deletar'), 'deletar');
    await rerender(<DeleteAccountModal {...props} visible={false} />);
    await rerender(<DeleteAccountModal {...props} visible />);

    expect(screen.getByPlaceholderText('deletar').props.value).toBe('');
    expect(getDeleteButton()).toBeDisabled();
  });
});
