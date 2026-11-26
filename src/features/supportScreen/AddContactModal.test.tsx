import { fireEvent, render, screen } from '@testing-library/react-native';
import { getModalHost } from '@test/sharedUiHelpers';

import { AddContactModal } from '@/features/supportScreen/AddContactModal';

type Props = Parameters<typeof AddContactModal>[0];

async function renderModal(props: Partial<Props> = {}) {
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const allProps: Props = {
    visible: true,
    loading: false,
    errorMessage: null,
    onClose,
    onConfirm,
    ...props,
  };
  const view = await render(<AddContactModal {...allProps} />);
  return { onClose, onConfirm, view, allProps };
}

function addButton() {
  return screen.getByRole('button', { name: 'Adicionar' });
}

describe('AddContactModal', () => {
  it('só habilita "Adicionar" com nome e telefone preenchidos', async () => {
    await renderModal();

    expect(screen.getByText('Adicionar pessoa de conforto')).toBeOnTheScreen();
    expect(addButton()).toBeDisabled();

    await fireEvent.changeText(screen.getByPlaceholderText('Nome da pessoa'), 'Ana');
    expect(addButton()).toBeDisabled();

    await fireEvent.changeText(screen.getByPlaceholderText('+55 51 99999-8888'), '51999998888');
    expect(addButton()).toBeEnabled();
  });

  it('aplica a máscara e envia nome aparado e telefone só com dígitos', async () => {
    const { onConfirm } = await renderModal();

    await fireEvent.changeText(screen.getByPlaceholderText('Nome da pessoa'), '  Ana  ');
    const phoneInput = screen.getByPlaceholderText('+55 51 99999-8888');
    await fireEvent.changeText(phoneInput, '51999998888');
    expect(phoneInput).toHaveDisplayValue('+55 51 99999-8888');

    await fireEvent.press(addButton());
    expect(onConfirm).toHaveBeenCalledWith('Ana', '5551999998888');
  });

  it('mostra erro de telefone inválido e limpa ao digitar de novo', async () => {
    const { onConfirm } = await renderModal();

    await fireEvent.changeText(screen.getByPlaceholderText('Nome da pessoa'), 'Ana');
    await fireEvent.changeText(screen.getByPlaceholderText('+55 51 99999-8888'), '5199');
    await fireEvent.press(addButton());

    expect(screen.getByRole('alert')).toHaveTextContent('Formato de telefone inválido.');
    expect(onConfirm).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByPlaceholderText('+55 51 99999-8888'), '51999');
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });

  it('mostra o erro vindo da tela', async () => {
    await renderModal({ errorMessage: 'Não foi possível adicionar agora.' });

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível adicionar agora.');
  });

  it('fecha pelo cancelar e pelo voltar do sistema', async () => {
    const { onClose } = await renderModal();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    await fireEvent(getModalHost(), 'requestClose');

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('não fecha enquanto envia', async () => {
    const { onClose } = await renderModal({ loading: true });

    await fireEvent(getModalHost(), 'requestClose');

    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Nome da pessoa')).not.toBeEnabled();
  });

  it('limpa os campos ao ser escondido', async () => {
    const { view, allProps } = await renderModal();

    await fireEvent.changeText(screen.getByPlaceholderText('Nome da pessoa'), 'Ana');
    await view.rerender(<AddContactModal {...allProps} visible={false} />);
    await view.rerender(<AddContactModal {...allProps} visible />);

    expect(screen.getByPlaceholderText('Nome da pessoa')).toHaveDisplayValue('');
  });
});
