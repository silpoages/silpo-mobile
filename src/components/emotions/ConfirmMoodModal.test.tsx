import { fireEvent, render, screen } from '@testing-library/react-native';

import { getModalHost } from '@test/sharedUiHelpers';
import { ConfirmMoodModal } from '@/components/emotions/ConfirmMoodModal';

function renderModal(props: Partial<Parameters<typeof ConfirmMoodModal>[0]> = {}) {
  const onClose = jest.fn();
  const onConfirm = jest.fn();
  const result = render(
    <ConfirmMoodModal
      visible
      moodLabel="Feliz"
      loading={false}
      errorMessage={null}
      onClose={onClose}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { onClose, onConfirm, result };
}

describe('ConfirmMoodModal', () => {
  it('mostra a emoção escolhida e confirma', async () => {
    const { onConfirm, result } = renderModal();
    await result;

    expect(screen.getByText('Confirmar emoção')).toBeOnTheScreen();
    expect(screen.getByText('Feliz')).toBeOnTheScreen();
    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('fecha ao cancelar e ao pedir para fechar', async () => {
    const { onClose, result } = renderModal();
    await result;

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    await fireEvent(getModalHost(), 'requestClose');

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('não fecha enquanto carrega e mostra o erro', async () => {
    const { onClose, result } = renderModal({ loading: true, errorMessage: 'Falhou' });
    await result;

    expect(screen.getByRole('alert')).toHaveTextContent('Falhou');
    await fireEvent(getModalHost(), 'requestClose');

    expect(onClose).not.toHaveBeenCalled();
  });
});
