import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import SupportRoute from '../../../app/(tabs)/apoio';
import { WELCOME_ROUTE } from '@/features/auth/session/routeAccess';
import { SupportScreen } from '@/features/supportScreen/SupportScreen';
import {
  createEmergencyContact,
  listEmergencyContacts,
} from '@/features/supportScreen/emergencyContactsService';

const mockUseSession = jest.fn();

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockUseSession(),
}));
jest.mock('@/features/supportScreen/emergencyContactsService', () => ({
  listEmergencyContacts: jest.fn(),
  createEmergencyContact: jest.fn(),
}));

const mockListEmergencyContacts = jest.mocked(listEmergencyContacts);
const mockCreateEmergencyContact = jest.mocked(createEmergencyContact);

function makeContact(id: string, fullName: string) {
  return { id, fullName, phoneNumber: `55519999${id}`, imageUrl: null, createdAt: 'x' };
}

function authenticated(overrides: Record<string, unknown> = {}) {
  mockUseSession.mockReturnValue({
    token: 'tok',
    isAuthenticated: true,
    user: { id: 'u1', email: 'ana@x.com', fullName: 'Ana' },
    ...overrides,
  });
}

async function openAddModalAndFill() {
  await fireEvent.press(screen.getByRole('button', { name: '+ Adicionar pessoa de conforto' }));
  await fireEvent.changeText(screen.getByPlaceholderText('Nome da pessoa'), 'Bia');
  await fireEvent.changeText(screen.getByPlaceholderText('+55 51 99999-8888'), '51988887777');
}

beforeEach(() => {
  jest.clearAllMocks();
  authenticated();
  mockListEmergencyContacts.mockResolvedValue([makeContact('1', 'Carla')]);
});

describe('SupportScreen', () => {
  it('a rota renderiza a tela de apoio', async () => {
    await render(<SupportRoute />);

    expect(await screen.findByText('Carla')).toBeOnTheScreen();
  });

  it('logado: mostra avatar, contatos e o botão de adicionar', async () => {
    await render(<SupportScreen />);

    expect(screen.getByRole('header')).toHaveTextContent('Apoio');
    expect(screen.getByText('Você não precisa enfrentar esse momento sozinho.')).toBeOnTheScreen();
    expect(await screen.findByText('Carla')).toBeOnTheScreen();
    expect(mockListEmergencyContacts).toHaveBeenCalledWith('tok');
    expect(screen.queryByRole('button', { name: 'Fechar' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Abrir perfil' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/perfil');
  });

  it('usa o e-mail no avatar quando não há nome', async () => {
    authenticated({ user: { id: 'u1', email: 'zeca@x.com', fullName: '  ' } });
    await render(<SupportScreen />);

    expect(screen.getByRole('button', { name: 'Abrir perfil' })).toHaveTextContent('Z');
  });

  it('sem sessão: mostra o X, não busca contatos e volta para a Welcome', async () => {
    mockUseSession.mockReturnValue({ token: null, isAuthenticated: false, user: null });
    await render(<SupportScreen />);

    expect(mockListEmergencyContacts).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', { name: '+ Adicionar pessoa de conforto' }),
    ).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Abrir perfil' })).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Fechar' }));
    expect(mockRouter.dismissTo).toHaveBeenCalledWith(WELCOME_ROUTE);
  });

  it('liga para o CVV', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await render(<SupportScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Ligar 188' }));

    expect(openURL).toHaveBeenCalledWith('tel:188');
  });

  it('abre a respiração com a origem do apoio', async () => {
    await render(<SupportScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Começar' }));

    expect(mockRouter.push).toHaveBeenCalledWith({
      pathname: '/respiracao',
      params: { origem: 'apoio' },
    });
  });

  it('adiciona um contato no topo da lista e fecha o modal', async () => {
    mockCreateEmergencyContact.mockResolvedValue(makeContact('2', 'Bia'));
    await render(<SupportScreen />);
    await screen.findByText('Carla');

    await openAddModalAndFill();
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar' }));

    await waitFor(() =>
      expect(screen.queryByText('Adicionar pessoa de conforto')).not.toBeOnTheScreen(),
    );
    expect(mockCreateEmergencyContact).toHaveBeenCalledWith('tok', {
      fullName: 'Bia',
      phoneNumber: '5551988887777',
    });
    const names = screen.getAllByText(/^(Bia|Carla)$/).map((node) => node.props.children);
    expect(names).toEqual(['Bia', 'Carla']);
  });

  it('mostra erro quando não consegue adicionar e permite cancelar', async () => {
    mockCreateEmergencyContact.mockRejectedValue(new Error('offline'));
    await render(<SupportScreen />);

    await openAddModalAndFill();
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível adicionar agora. Tente novamente.',
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByText('Adicionar pessoa de conforto')).not.toBeOnTheScreen();
  });

  it('não envia o contato se a sessão sumir com o modal aberto', async () => {
    const view = await render(<SupportScreen />);
    await openAddModalAndFill();

    authenticated({ token: null });
    await view.rerender(<SupportScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Adicionar' }));

    expect(mockCreateEmergencyContact).not.toHaveBeenCalled();
  });
});
