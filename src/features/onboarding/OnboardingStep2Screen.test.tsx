import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';
import { makeSession, withOnboarding } from '@test/onboardingTestUtils';

import { useSession } from '@/features/auth/session/SessionContext';
import { createEmergencyContact } from '@/features/supportScreen/emergencyContactsService';
import { ApiError } from '@/services/apiClient';

import { OnboardingStep2Screen } from '@/features/onboarding/OnboardingStep2Screen';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/features/supportScreen/emergencyContactsService', () => ({
  createEmergencyContact: jest.fn(),
}));

const mockUseSession = jest.mocked(useSession);
const mockCreateContact = jest.mocked(createEmergencyContact);

const profileSaved = (state: { setIsProfileSaved: (value: boolean) => void }) =>
  state.setIsProfileSaved(true);

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSession.mockReturnValue(makeSession());
});

async function renderStep2() {
  await render(withOnboarding(<OnboardingStep2Screen />, profileSaved));
}

async function fillContact(name: string, phone: string) {
  await fireEvent.changeText(screen.getByTestId('support-name-field'), name);
  await fireEvent.changeText(screen.getByTestId('support-phone-field'), phone);
}

describe('OnboardingStep2Screen', () => {
  it('volta para a etapa 1 quando o perfil ainda não foi preenchido', async () => {
    await render(withOnboarding(<OnboardingStep2Screen />));
    expect(screen.getByTestId('redirect')).toHaveTextContent('/onboarding/etapa-1');
  });

  it('mostra a etapa 3 de 4 e volta pelo cabeçalho', async () => {
    await renderStep2();

    expect(screen.getByText('Quem é sua pessoa de conforto?')).toBeTruthy();
    expect(screen.getByText('3 de 4')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('back-button'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('pula a etapa pelo link', async () => {
    await renderStep2();
    await fireEvent.press(screen.getByTestId('skip-button'));
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/etapa-3');
  });

  it('avança sem criar contato quando nome ou telefone estão vazios', async () => {
    await renderStep2();
    await fillContact('Bia', '');
    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(mockCreateContact).not.toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/etapa-3');
  });

  it('aplica a máscara de telefone e valida o formato', async () => {
    await renderStep2();
    await fillContact('Bia', '51999');

    expect(screen.getByTestId('support-phone-field').props.value).toBe('+55 51 999');

    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(screen.getByRole('alert')).toHaveTextContent('Formato de telefone inválido.');
    expect(mockCreateContact).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('cria o contato com o telefone sem máscara e avança', async () => {
    mockCreateContact.mockResolvedValue({
      id: 'c1',
      fullName: 'Bia',
      phoneNumber: '5551999998888',
      imageUrl: null,
      createdAt: '2026-01-01',
    });
    await renderStep2();
    await fillContact('  Bia  ', '51999998888');

    await fireEvent.press(screen.getByTestId('continue-button'));

    await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/etapa-3'));
    expect(mockCreateContact).toHaveBeenCalledWith('token-123', {
      fullName: 'Bia',
      phoneNumber: '5551999998888',
    });
  });

  it('mostra a mensagem da API quando a criação falha', async () => {
    mockCreateContact.mockRejectedValue(new ApiError(409, 'Contato já existe'));
    await renderStep2();
    await fillContact('Bia', '51999998888');

    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(await screen.findByRole('alert')).toHaveTextContent('Contato já existe');
    expect(mockRouter.push).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId('continue-button')).not.toBeDisabled());
  });

  it('mostra mensagem genérica para erros inesperados', async () => {
    mockCreateContact.mockRejectedValue(new Error('rede'));
    await renderStep2();
    await fillContact('Bia', '51999998888');

    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível adicionar agora. Tente novamente ou pule esta etapa.',
    );
    await waitFor(() => expect(screen.getByTestId('skip-button')).not.toBeDisabled());
  });

  it('não envia sem token de sessão', async () => {
    mockUseSession.mockReturnValue(makeSession({ token: null }));
    await renderStep2();
    await fillContact('Bia', '51999998888');

    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(mockCreateContact).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('desabilita os campos enquanto envia', async () => {
    let resolveCreate!: () => void;
    mockCreateContact.mockReturnValue(
      new Promise((resolve) => {
        resolveCreate = () =>
          resolve({
            id: 'c1',
            fullName: 'Bia',
            phoneNumber: '5551999998888',
            imageUrl: null,
            createdAt: '2026-01-01',
          });
      }),
    );
    await renderStep2();
    await fillContact('Bia', '51999998888');

    // O fireEvent espera o handler assíncrono; só termina depois que a criação resolve.
    const pressing = fireEvent.press(screen.getByTestId('continue-button'));

    await waitFor(() =>
      expect(screen.getByTestId('support-name-field').props.editable).toBe(false),
    );
    expect(screen.getByTestId('skip-button')).toBeDisabled();

    await act(async () => {
      resolveCreate();
      await pressing;
    });
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/etapa-3');
  });
});
