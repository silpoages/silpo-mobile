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

export async function uploadDiaryImage(token: string, photoUri: string): Promise<string> {
  const body = new FormData();
  body.append('file', {
    uri: photoUri,
    name: 'diario.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(`${API_BASE_URL}/diary-entries/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    body,
  });

  if (!response.ok) {
    throw new Error('Não foi possível enviar a foto.');
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

export function deleteDiaryEntry(token: string, entryId: string) {
  return apiRequest<void>(`/diary-entries/${encodeURIComponent(entryId)}`, {
    method: 'DELETE',
    token,
  });
}
