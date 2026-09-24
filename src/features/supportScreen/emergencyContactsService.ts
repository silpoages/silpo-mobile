import { apiRequest } from '@/services/apiClient';

export type EmergencyContact = {
  id: string;
  fullName: string;
  phoneNumber: string;
  imageUrl: string | null;
  createdAt: string;
};

export type NewEmergencyContact = {
  fullName: string;
  phoneNumber: string;
};

type EmergencyContactResponse = {
  id: string;
  full_name: string;
  phone_number: string;
  image_url: string | null;
  created_at: string;
};

type EmergencyContactListResponse = {
  contacts: EmergencyContactResponse[];
};

function toEmergencyContact(response: EmergencyContactResponse): EmergencyContact {
  return {
    id: response.id,
    fullName: response.full_name,
    phoneNumber: response.phone_number,
    imageUrl: response.image_url,
    createdAt: response.created_at,
  };
}

/** Lista os contatos de apoio do usuário logado (`GET /emergency-contacts`). */
export async function listEmergencyContacts(token: string): Promise<EmergencyContact[]> {
  const response = await apiRequest<EmergencyContactListResponse>('/emergency-contacts', {
    token,
  });

  return response.contacts.map(toEmergencyContact);
}

/** Cria um novo contato de apoio (`POST /emergency-contacts`). */
export async function createEmergencyContact(
  token: string,
  contact: NewEmergencyContact,
): Promise<EmergencyContact> {
  const response = await apiRequest<EmergencyContactResponse>('/emergency-contacts', {
    method: 'POST',
    token,
    body: { full_name: contact.fullName, phone_number: contact.phoneNumber },
  });

  return toEmergencyContact(response);
}
