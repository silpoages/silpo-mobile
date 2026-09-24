import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Gender } from '@/services/user';

type OnboardingContextValue = {
  fullName: string;
  setFullName: (value: string) => void;
  birthDate: Date | null;
  setBirthDate: (value: Date | null) => void;
  gender: Gender | null;
  setGender: (value: Gender | null) => void;
  dailyReminderEnabled: boolean;
  setDailyReminderEnabled: (value: boolean) => void;
  supportName: string;
  setSupportName: (value: string) => void;
  supportPhone: string;
  setSupportPhone: (value: string) => void;
  /** `true` depois que a etapa 1 salvou o perfil; as etapas 2 e 3 dependem dele. */
  isProfileSaved: boolean;
  setIsProfileSaved: (value: boolean) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

/** Estado das 3 etapas do onboarding — sem persistência em storage, não sobrevive a um reinício do app. */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [dailyReminderEnabled, setDailyReminderEnabled] = useState(true);
  const [supportName, setSupportName] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      fullName,
      setFullName,
      birthDate,
      setBirthDate,
      gender,
      setGender,
      dailyReminderEnabled,
      setDailyReminderEnabled,
      supportName,
      setSupportName,
      supportPhone,
      setSupportPhone,
      isProfileSaved,
      setIsProfileSaved,
    }),
    [fullName, birthDate, gender, dailyReminderEnabled, supportName, supportPhone, isProfileSaved],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding precisa ser usado dentro de um OnboardingProvider');
  }

  return context;
}
