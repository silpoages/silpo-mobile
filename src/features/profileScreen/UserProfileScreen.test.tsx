import { getModalHost } from '@test/sharedUiHelpers';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';
import { TEST_USER, makeSession } from '@test/onboardingTestUtils';

import { useSession } from '@/features/auth/session/SessionContext';
import UserProfileScreen from '@/features/profileScreen/UserProfileScreen';
import { listEmergencyContacts } from '@/features/supportScreen/emergencyContactsService';
import { deleteCurrentUser } from '@/services/user';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/features/supportScreen/emergencyContactsService', () => ({
  listEmergencyContacts: jest.fn(),
}));
jest.mock('@/services/user', () => ({ deleteCurrentUser: jest.fn() }));

const mockUseSession = jest.mocked(useSession);
const mockListContacts = jest.mocked(listEmergencyContacts);
const mockDeleteUser = jest.mocked(deleteCurrentUser);

let session: ReturnType<typeof makeSession>;

beforeEach(() => {
  jest.clearAllMocks();
  session = makeSession();
  mockUseSession.mockReturnValue(session);
  mockListContacts.mockResolvedValue([]);
  mockDeleteUser.mockResolvedValue();
});

async function renderScreen() {
  await render(<UserProfileScreen />);
  await waitFor(() => expect(mockListContacts).toHaveBeenCalled());
}

async function openDeleteModalAndConfirm() {
  await fireEvent.press(screen.getByText('Excluir conta'));
  await fireEvent.changeText(screen.getByPlaceholderText('deletar'), 'deletar');
}

describe('UserProfileScreen', () => {
  it('mostra nome, inicial, e-mail e as seções', async () => {
    await renderScreen();

    expect(screen.getByText('Perfil')).toBeTruthy();
    expect(screen.getByText('Ana Souza')).toBeTruthy();
    expect(screen.getByText('A')).toBeTruthy();
    expect(screen.getByText('ana@example.com')).toBeTruthy();
    expect(screen.getByText('CONTA')).toBeTruthy();
    expect(screen.getByText('EXPERIÊNCIA')).toBeTruthy();
  });

  it('usa o e-mail quando não há nome e "Você" quando não há usuário', async () => {
    mockUseSession.mockReturnValue(makeSession({ user: { ...TEST_USER, fullName: '   ' } }));
    const { unmount } = await render(<UserProfileScreen />);
    expect(screen.getAllByText('ana@example.com')).toHaveLength(2);
    await unmount();
    mockListContacts.mockClear();

    mockUseSession.mockReturnValue(makeSession({ token: null, user: null }));
    await render(<UserProfileScreen />);
    expect(screen.getByText('Você')).toBeTruthy();
    expect(screen.getByText('V')).toBeTruthy();
    expect(mockListContacts).not.toHaveBeenCalled();
  });

  it('mostra a primeira pessoa de conforto cadastrada', async () => {
    mockListContacts.mockResolvedValue([
      { id: '1', fullName: 'Bia', phoneNumber: '1', imageUrl: null, createdAt: '' },
      { id: '2', fullName: 'Caio', phoneNumber: '2', imageUrl: null, createdAt: '' },
    ]);
    await render(<UserProfileScreen />);

    expect(await screen.findByText('Bia')).toBeTruthy();
    expect(mockListContacts).toHaveBeenCalledWith('token-123');
    expect(screen.queryByText('Caio')).toBeNull();
  });

  it('ignora falha ao carregar a pessoa de conforto', async () => {
    mockListContacts.mockRejectedValue(new Error('rede'));
    await renderScreen();
    expect(screen.getByText('Pessoa de conforto')).toBeTruthy();
  });

  it('navega para apoio, notificações e mensagens apagadas', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByText('Pessoa de conforto'));
    await fireEvent.press(screen.getByText('Notificações'));
    await fireEvent.press(screen.getByText('Mensagens apagadas'));

    expect(mockRouter.push.mock.calls).toEqual([
      ['/apoio'],
      ['/notificacoes'],
      ['/mensagens-apagadas'],
    ]);
  });

  it('sai da conta e volta para a Welcome', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByText('Sair'));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/welcome'));
    expect(session.logout).toHaveBeenCalled();
  });

  it('abre e fecha o modal de exclusão', async () => {
    await renderScreen();

    await fireEvent.press(screen.getByText('Excluir conta'));
    expect(screen.getByPlaceholderText('deletar')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByPlaceholderText('deletar')).toBeNull();
  });

  it('exclui a conta, encerra a sessão e volta para a Welcome', async () => {
    await renderScreen();
    await openDeleteModalAndConfirm();

    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));

    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/welcome'));
    expect(mockDeleteUser).toHaveBeenCalledWith('token-123', 'user-1');
    expect(session.logout).toHaveBeenCalled();
    expect(screen.queryByPlaceholderText('deletar')).toBeNull();
  });

  it('mantém o modal aberto e não fecha durante a exclusão', async () => {
    let resolveDelete!: () => void;
    mockDeleteUser.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveDelete = resolve;
      }),
    );
    await renderScreen();
    await openDeleteModalAndConfirm();

    const pressing = fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));
    await waitFor(() => expect(screen.getByPlaceholderText('deletar').props.editable).toBe(false));

    // Fechar pelo voltar do sistema é ignorado enquanto exclui.
    await fireEvent(getModalHost(), 'requestClose');
    expect(screen.getByPlaceholderText('deletar')).toBeTruthy();

    await act(async () => {
      resolveDelete();
      await pressing;
    });
    await waitFor(() => expect(mockRouter.replace).toHaveBeenCalledWith('/welcome'));
    expect(mockDeleteUser).toHaveBeenCalledTimes(1);
  });

  it('não exclui sem usuário na sessão', async () => {
    mockUseSession.mockReturnValue(makeSession({ user: null }));
    await renderScreen();
    await openDeleteModalAndConfirm();

    await fireEvent.press(screen.getByRole('button', { name: 'Excluir' }));

    expect(mockDeleteUser).not.toHaveBeenCalled();
  });
});
