import { apiRequest } from '@/services/apiClient';
import {
  createEmergencyContact,
  listEmergencyContacts,
} from '@/features/supportScreen/emergencyContactsService';

jest.mock('@/services/apiClient', () => ({ apiRequest: jest.fn() }));

const mockApiRequest = jest.mocked(apiRequest);

const apiContact = {
  id: 'c1',
  full_name: 'Ana',
  phone_number: '5551999998888',
  image_url: null,
  created_at: '2026-01-01T00:00:00Z',
};

const contact = {
  id: 'c1',
  fullName: 'Ana',
  phoneNumber: '5551999998888',
  imageUrl: null,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('emergencyContactsService', () => {
  it('lista e converte os contatos', async () => {
    mockApiRequest.mockResolvedValueOnce({ contacts: [apiContact] });

    await expect(listEmergencyContacts('tok')).resolves.toEqual([contact]);
    expect(mockApiRequest).toHaveBeenCalledWith('/emergency-contacts', { token: 'tok' });
  });

  it('cria um contato com o corpo em snake_case', async () => {
    mockApiRequest.mockResolvedValueOnce(apiContact);

    await expect(
      createEmergencyContact('tok', { fullName: 'Ana', phoneNumber: '5551999998888' }),
    ).resolves.toEqual(contact);
    expect(mockApiRequest).toHaveBeenCalledWith('/emergency-contacts', {
      method: 'POST',
      token: 'tok',
      body: { full_name: 'Ana', phone_number: '5551999998888' },
    });
  });
});
