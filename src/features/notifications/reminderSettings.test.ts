import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_REMINDER_TIME,
  formatReminderTime,
  getReminderTime,
  saveReminderTime,
} from '@/features/notifications/reminderSettings';

const STORAGE_KEY = 'silpo.dailyReminder.time';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

describe('getReminderTime', () => {
  it('usa o padrão quando nada foi salvo', async () => {
    await expect(getReminderTime()).resolves.toEqual(DEFAULT_REMINDER_TIME);
  });

  it('devolve o horário salvo', async () => {
    await saveReminderTime({ hour: 7, minute: 30 });
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify({ hour: 7, minute: 30 }));
    await expect(getReminderTime()).resolves.toEqual({ hour: 7, minute: 30 });
  });

  it.each([
    'null',
    '"texto"',
    '{"hour":24,"minute":0}',
    '{"hour":-1,"minute":0}',
    '{"hour":10,"minute":60}',
    '{"hour":10,"minute":-1}',
    '{"hour":1.5,"minute":0}',
    '{"hour":10}',
  ])('usa o padrão quando o valor salvo é inválido: %s', async (raw) => {
    await AsyncStorage.setItem(STORAGE_KEY, raw);
    await expect(getReminderTime()).resolves.toEqual(DEFAULT_REMINDER_TIME);
  });

  it('usa o padrão quando o JSON está corrompido', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{quebrado');
    await expect(getReminderTime()).resolves.toEqual(DEFAULT_REMINDER_TIME);
  });

  it('usa o padrão quando o storage falha', async () => {
    jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('falhou'));
    await expect(getReminderTime()).resolves.toEqual(DEFAULT_REMINDER_TIME);
  });

  it('aceita os limites 00:00 e 23:59', async () => {
    await saveReminderTime({ hour: 0, minute: 0 });
    await expect(getReminderTime()).resolves.toEqual({ hour: 0, minute: 0 });
    await saveReminderTime({ hour: 23, minute: 59 });
    await expect(getReminderTime()).resolves.toEqual({ hour: 23, minute: 59 });
  });
});

describe('formatReminderTime', () => {
  it('formata HH:MM com zero à esquerda', () => {
    expect(formatReminderTime({ hour: 8, minute: 5 })).toBe('08:05');
    expect(formatReminderTime({ hour: 20, minute: 30 })).toBe('20:30');
  });
});
