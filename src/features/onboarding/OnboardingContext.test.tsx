import { act, renderHook } from '@testing-library/react-native';

import { OnboardingProvider, useOnboarding } from '@/features/onboarding/OnboardingContext';

describe('OnboardingContext', () => {
  it('começa vazio, com lembrete ativo, e guarda cada campo', async () => {
    const { result } = await renderHook(() => useOnboarding(), { wrapper: OnboardingProvider });

    expect(result.current).toMatchObject({
      fullName: '',
      birthDate: null,
      gender: null,
      dailyReminderEnabled: true,
      supportName: '',
      supportPhone: '',
      isProfileSaved: false,
    });

    const birthDate = new Date(2000, 0, 1);
    await act(() => {
      result.current.setFullName('Ana');
      result.current.setBirthDate(birthDate);
      result.current.setGender('FEMALE');
      result.current.setDailyReminderEnabled(false);
      result.current.setSupportName('Bia');
      result.current.setSupportPhone('+55 51 99999-8888');
      result.current.setIsProfileSaved(true);
    });

    expect(result.current).toMatchObject({
      fullName: 'Ana',
      birthDate,
      gender: 'FEMALE',
      dailyReminderEnabled: false,
      supportName: 'Bia',
      supportPhone: '+55 51 99999-8888',
      isProfileSaved: true,
    });
  });

  it('exige o provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useOnboarding())).rejects.toThrow(
      'useOnboarding precisa ser usado dentro de um OnboardingProvider',
    );
  });
});
