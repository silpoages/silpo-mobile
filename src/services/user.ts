import { apiRequest } from '@/services/apiClient';

/** `DELETE /users/{userId}` — só apaga a própria conta (ou qualquer uma, se admin). */
export async function deleteCurrentUser(token: string, userId: string): Promise<void> {
  await apiRequest<{ message: string }>(`/users/${userId}`, {
    method: 'DELETE',
    token,
  });
}

export type Gender = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY';

/** Opções do select de gênero, na ordem e rótulos do Figma (nó 4341:1914). */
export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: 'Homem' },
  { value: 'FEMALE', label: 'Mulher' },
  { value: 'NON_BINARY', label: 'Não-binário' },
  { value: 'OTHER', label: 'Outro' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefiro não informar' },
];

export type UpdateCurrentUserInput = {
  fullName: string;
  /** Formato ISO `AAAA-MM-DD`. */
  birthDate: string;
  gender: Gender;
  dailyReminderEnabled: boolean;
};

export type CurrentUser = {
  fullName: string;
  birthDate: string;
  gender: Gender;
  email: string;
  dailyReminderEnabled: boolean;
  onboardingCompleted: boolean;
};

type UpdateCurrentUserResponse = {
  full_name: string;
  birth_date: string;
  gender: Gender;
  email: string;
  daily_reminder_enabled: boolean;
  onboarding_completed: boolean;
};

/** `PATCH /users` — o schema exige os 4 campos sempre, por isso o onboarding reenvia tudo a cada etapa. */
export async function updateCurrentUser(
  token: string,
  input: UpdateCurrentUserInput,
): Promise<CurrentUser> {
  const response = await apiRequest<UpdateCurrentUserResponse>('/users', {
    method: 'PATCH',
    token,
    body: {
      full_name: input.fullName,
      birth_date: input.birthDate,
      gender: input.gender,
      daily_reminder_enabled: input.dailyReminderEnabled,
    },
  });

  return {
    fullName: response.full_name,
    birthDate: response.birth_date,
    gender: response.gender,
    email: response.email,
    dailyReminderEnabled: response.daily_reminder_enabled,
    onboardingCompleted: response.onboarding_completed,
  };
}
