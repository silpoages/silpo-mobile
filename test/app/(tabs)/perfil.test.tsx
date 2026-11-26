import { render, screen, waitFor } from '@testing-library/react-native';
import { makeSession } from '@test/onboardingTestUtils';

import { useSession } from '@/features/auth/session/SessionContext';
import { listEmergencyContacts } from '@/features/supportScreen/emergencyContactsService';

import ProfileRoute from '../../../app/(tabs)/perfil';

jest.mock('@/features/auth/session/SessionContext', () => ({ useSession: jest.fn() }));
jest.mock('@/features/supportScreen/emergencyContactsService', () => ({
  listEmergencyContacts: jest.fn(),
}));

describe('rota /perfil', () => {
  it('renderiza a tela de perfil', async () => {
    jest.mocked(useSession).mockReturnValue(makeSession());
    jest.mocked(listEmergencyContacts).mockResolvedValue([]);

    await render(<ProfileRoute />);

    expect(screen.getByText('Perfil')).toBeTruthy();
    await waitFor(() => expect(listEmergencyContacts).toHaveBeenCalledWith('token-123'));
  });
});
