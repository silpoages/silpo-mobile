import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import type { MoodId } from '@/components/emotions/moodLogService';
import { API_BASE_URL, apiRequest } from '@/services/apiClient';
import type { DiaryEntry } from './diaryTypes';

type DiaryEntryResponse = {
  id: string;
  entry_date: string;
  note: string;
  image_url: string | null;
  mood_log_id: string | null;
  mood: MoodId | null;
  practice: { id: string; title: string } | null;
};

type DiaryListResponse = {
  items: DiaryEntryResponse[];
  page: number;
  page_size: number;
  total: number;
};

type CalendarResponse = {
  days: { entry_date: string; entries_count: number; moods: MoodId[] }[];
};

type MoodLogItem = {
  id: string;
  mood: MoodId;
  posted_at: string;
};

type MoodLogListResponse = {
  items: MoodLogItem[];
};

export type DiaryDay = {
  date: string;
  entriesCount: number;
  moods: MoodId[];
};

function imageUrl(key: string | null): string | null {
  if (!key) return null;
  return `${API_BASE_URL}/diary-entries/images/${key}`;
}

function toEntry(response: DiaryEntryResponse): DiaryEntry & { moodLogId: string | null } {
  return {
    id: response.id,
    date: response.entry_date,
    mood: response.mood,
    note: response.note,
    photoUri: imageUrl(response.image_url),
    practiceTitle: response.practice?.title ?? null,
    moodLogId: response.mood_log_id,
  };
}

export async function getDiaryCalendar(token: string, month: string): Promise<DiaryDay[]> {
  const response = await apiRequest<CalendarResponse>(
    `/diary-entries/calendar?month=${encodeURIComponent(month)}`,
    { token },
  );
  return response.days.map((day) => ({
    date: day.entry_date,
    entriesCount: day.entries_count,
    moods: day.moods,
  }));
}

export async function listDiaryEntries(token: string, startDate: string, endDate: string) {
  const pageSize = 100;
  const entries: (DiaryEntry & { moodLogId: string | null })[] = [];
  let page = 1;
  let total = 0;

  do {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      page: String(page),
      page_size: String(pageSize),
    });
    const response = await apiRequest<DiaryListResponse>(`/diary-entries?${params.toString()}`, {
      token,
    });
    total = response.total;
    entries.push(...response.items.map(toEntry));
    if (response.items.length === 0) break;
    page += 1;
  } while (entries.length < total);

  return entries;
}

export async function listMoodLogs(token: string, date: string) {
  const response = await apiRequest<MoodLogListResponse>(
    `/mood-logs?date=${encodeURIComponent(date)}`,
    { token },
  );
  return response.items;
}

/** Falha no envio da foto, com uma mensagem que pode ir direto para a tela. */
export class DiaryPhotoUploadError extends Error {
  constructor(readonly status: number) {
    super(
      status === 413
        ? 'A foto é grande demais. Escolha outra foto.'
        : status === 415
          ? 'Esse formato de foto não é aceito. Use JPG ou PNG.'
          : 'Não foi possível enviar a foto.',
    );
    this.name = 'DiaryPhotoUploadError';
  }
}

export async function uploadDiaryImage(token: string, photoUri: string): Promise<string> {
  // O objeto { uri, name, type } do React Native não serve em nenhuma plataforma: no web o
  // FormData o transforma na string "[object Object]", e no Android/iOS o fetch global do
  // Expo 57 é o `expo/fetch`, que também não o entende. O backend recebe texto em vez de
  // arquivo e responde 422.
  const body = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(photoUri)).blob();
    body.append('file', blob, 'diario.jpg');
  } else {
    // `File` do expo-file-system é o formato de arquivo que o `expo/fetch` sabe enviar.
    body.append('file', new File(photoUri));
  }

  const response = await fetch(`${API_BASE_URL}/diary-entries/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body,
  });

  if (!response.ok) {
    throw new DiaryPhotoUploadError(response.status);
  }

  const payload = (await response.json()) as { image_url: string };
  return payload.image_url;
}

export async function createDiaryEntry(
  token: string,
  input: { note: string; entryDate: string; mood: MoodId | null; imageUrl: string | null },
) {
  const response = await apiRequest<DiaryEntryResponse>('/diary-entries', {
    method: 'POST',
    token,
    body: {
      note: input.note,
      entry_date: input.entryDate,
      ...(input.mood ? { mood: input.mood } : {}),
      ...(input.imageUrl ? { image_url: input.imageUrl } : {}),
    },
  });
  return toEntry(response);
}

type DeletedDiaryEntryResponse = DiaryEntryResponse & { deleted_at: string };

type DeletedDiaryListResponse = {
  items: DeletedDiaryEntryResponse[];
  total: number;
};

export type DeletedDiaryEntry = {
  id: string;
  date: string;
  mood: MoodId | null;
  note: string;
  /** A foto é removida ao apagar; o registro volta sem ela. */
  hadPhoto: boolean;
  practiceTitle: string | null;
  deletedAt: string;
};

/** Registros do diário apagados pelo usuário, do mais recente ao mais antigo. */
export async function listDeletedDiaryEntries(token: string): Promise<DeletedDiaryEntry[]> {
  const pageSize = 100;
  const entries: DeletedDiaryEntry[] = [];
  let page = 1;
  let total = 0;

  do {
    const response = await apiRequest<DeletedDiaryListResponse>(
      `/diary-entries/deleted?page=${page}&page_size=${pageSize}`,
      { token },
    );
    total = response.total;
    entries.push(
      ...response.items.map((item) => ({
        id: item.id,
        date: item.entry_date,
        mood: item.mood,
        note: item.note,
        hadPhoto: item.image_url !== null,
        practiceTitle: item.practice?.title ?? null,
        deletedAt: item.deleted_at,
      })),
    );
    if (response.items.length === 0) break;
    page += 1;
  } while (entries.length < total);

  return entries;
}

/** Devolve o registro ao diário. */
export async function restoreDiaryEntry(token: string, entryId: string): Promise<void> {
  await apiRequest<DiaryEntryResponse>(`/diary-entries/${encodeURIComponent(entryId)}/restore`, {
    method: 'POST',
    token,
  });
}

export function deleteDiaryEntry(token: string, entryId: string) {
  return apiRequest<void>(`/diary-entries/${encodeURIComponent(entryId)}`, {
    method: 'DELETE',
    token,
  });
}
