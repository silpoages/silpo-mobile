import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import {
  DiaryPhotoUploadError,
  createDiaryEntry,
  deleteDiaryEntry,
  getDiaryCalendar,
  listDeletedDiaryEntries,
  listDiaryEntries,
  listMoodLogs,
  restoreDiaryEntry,
  uploadDiaryImage,
} from '@/features/diaryScreen/diaryService';

jest.mock('expo-file-system', () => ({
  File: jest.fn().mockImplementation((uri: string) => ({ mockFileUri: uri })),
}));

type FakeResponse = { ok?: boolean; status?: number; body?: unknown; blob?: Blob };

function queueResponses(...responses: FakeResponse[]) {
  const fetchMock = jest.fn();
  for (const r of responses) {
    fetchMock.mockResolvedValueOnce({
      ok: r.ok ?? true,
      status: r.status ?? 200,
      statusText: '',
      json: () => Promise.resolve(r.body),
      blob: () => Promise.resolve(r.blob),
    });
  }
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

function entryResponse(overrides: Record<string, unknown> = {}) {
  return {
    id: 'e1',
    entry_date: '2026-11-25',
    note: 'Nota',
    image_url: 'img.jpg',
    mood_log_id: 'm1',
    mood: 'FELIZ',
    practice: { id: 'p1', title: 'Respiração' },
    ...overrides,
  };
}

const originalOS = Platform.OS;

afterEach(() => {
  Platform.OS = originalOS;
});

describe('getDiaryCalendar', () => {
  it('busca o mês codificado e converte os dias', async () => {
    const fetchMock = queueResponses({
      body: { days: [{ entry_date: '2026-11-01', entries_count: 2, moods: ['FELIZ'] }] },
    });

    await expect(getDiaryCalendar('tok', '2026-11')).resolves.toEqual([
      { date: '2026-11-01', entriesCount: 2, moods: ['FELIZ'] },
    ]);
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/diary-entries/calendar?month=2026-11');
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
  });
});

describe('listDiaryEntries', () => {
  it('pagina até juntar o total e converte cada registro', async () => {
    const fetchMock = queueResponses(
      { body: { items: [entryResponse()], page: 1, page_size: 100, total: 2 } },
      {
        body: {
          items: [entryResponse({ id: 'e2', image_url: null, practice: null, mood: null })],
          page: 2,
          page_size: 100,
          total: 2,
        },
      },
    );

    const entries = await listDiaryEntries('tok', '2026-11-01', '2026-11-30');

    expect(entries).toEqual([
      {
        id: 'e1',
        date: '2026-11-25',
        mood: 'FELIZ',
        note: 'Nota',
        photoUri: 'http://api.test/diary-entries/images/img.jpg',
        practiceTitle: 'Respiração',
        moodLogId: 'm1',
      },
      {
        id: 'e2',
        date: '2026-11-25',
        mood: null,
        note: 'Nota',
        photoUri: null,
        practiceTitle: null,
        moodLogId: 'm1',
      },
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://api.test/diary-entries?start_date=2026-11-01&end_date=2026-11-30&page=1&page_size=100',
    );
    expect(fetchMock.mock.calls[1][0]).toContain('page=2');
  });

  it('para quando uma página vem vazia', async () => {
    const fetchMock = queueResponses({ body: { items: [], page: 1, page_size: 100, total: 5 } });

    await expect(listDiaryEntries('tok', 'a', 'b')).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('listMoodLogs', () => {
  it('retorna os itens do dia', async () => {
    const items = [{ id: 'm1', mood: 'TRISTE', posted_at: '2026-11-25T10:00:00Z' }];
    const fetchMock = queueResponses({ body: { items } });

    await expect(listMoodLogs('tok', '2026-11-25')).resolves.toEqual(items);
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/mood-logs?date=2026-11-25');
  });
});

describe('DiaryPhotoUploadError', () => {
  it.each([
    [413, 'A foto é grande demais. Escolha outra foto.'],
    [415, 'Esse formato de foto não é aceito. Use JPG ou PNG.'],
    [500, 'Não foi possível enviar a foto.'],
  ])('status %i tem mensagem amigável', (status, message) => {
    const error = new DiaryPhotoUploadError(status);
    expect(error.message).toBe(message);
    expect(error.status).toBe(status);
    expect(error.name).toBe('DiaryPhotoUploadError');
  });
});

describe('uploadDiaryImage', () => {
  it('no nativo envia um File do expo-file-system', async () => {
    Platform.OS = 'android';
    const fetchMock = queueResponses({ body: { image_url: 'key.jpg' } });

    await expect(uploadDiaryImage('tok', 'file:///photo.jpg')).resolves.toBe('key.jpg');

    expect(File).toHaveBeenCalledWith('file:///photo.jpg');
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://api.test/diary-entries/images');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ Authorization: 'Bearer tok', Accept: 'application/json' });
    expect(init.body).toBeInstanceOf(FormData);
  });

  it('no web baixa a URI como blob antes de enviar', async () => {
    Platform.OS = 'web';
    const blob = new Blob(['x'], { type: 'image/jpeg' });
    const fetchMock = queueResponses({ blob }, { body: { image_url: 'web.jpg' } });

    await expect(uploadDiaryImage('tok', 'blob:local')).resolves.toBe('web.jpg');
    expect(fetchMock.mock.calls[0][0]).toBe('blob:local');
    expect(fetchMock.mock.calls[1][0]).toBe('http://api.test/diary-entries/images');
  });

  it('lança DiaryPhotoUploadError quando o backend recusa', async () => {
    Platform.OS = 'ios';
    queueResponses({ ok: false, status: 413 });

    await expect(uploadDiaryImage('tok', 'file:///photo.jpg')).rejects.toMatchObject({
      name: 'DiaryPhotoUploadError',
      status: 413,
    });
  });
});

describe('createDiaryEntry', () => {
  it('envia humor e imagem quando presentes', async () => {
    const fetchMock = queueResponses({ body: entryResponse() });

    const entry = await createDiaryEntry('tok', {
      note: 'Nota',
      entryDate: '2026-11-25',
      mood: 'FELIZ',
      imageUrl: 'img.jpg',
    });

    expect(entry.id).toBe('e1');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      note: 'Nota',
      entry_date: '2026-11-25',
      mood: 'FELIZ',
      image_url: 'img.jpg',
    });
  });

  it('omite humor e imagem ausentes', async () => {
    const fetchMock = queueResponses({ body: entryResponse() });

    await createDiaryEntry('tok', { note: 'n', entryDate: 'd', mood: null, imageUrl: null });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ note: 'n', entry_date: 'd' });
  });
});

describe('listDeletedDiaryEntries', () => {
  it('pagina e marca se o registro tinha foto', async () => {
    const fetchMock = queueResponses(
      { body: { items: [{ ...entryResponse(), deleted_at: '2026-11-26' }], total: 2 } },
      {
        body: {
          items: [
            { ...entryResponse({ id: 'e2', image_url: null, practice: null }), deleted_at: 'x' },
          ],
          total: 2,
        },
      },
    );

    await expect(listDeletedDiaryEntries('tok')).resolves.toEqual([
      {
        id: 'e1',
        date: '2026-11-25',
        mood: 'FELIZ',
        note: 'Nota',
        hadPhoto: true,
        practiceTitle: 'Respiração',
        deletedAt: '2026-11-26',
      },
      {
        id: 'e2',
        date: '2026-11-25',
        mood: 'FELIZ',
        note: 'Nota',
        hadPhoto: false,
        practiceTitle: null,
        deletedAt: 'x',
      },
    ]);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'http://api.test/diary-entries/deleted?page=1&page_size=100',
    );
    expect(fetchMock.mock.calls[1][0]).toContain('page=2');
  });

  it('para quando uma página vem vazia', async () => {
    const fetchMock = queueResponses({ body: { items: [], total: 3 } });
    await expect(listDeletedDiaryEntries('tok')).resolves.toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('restore/delete', () => {
  it('restoreDiaryEntry faz POST no /restore com o id codificado', async () => {
    const fetchMock = queueResponses({ body: entryResponse() });
    await restoreDiaryEntry('tok', 'a/b');
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/diary-entries/a%2Fb/restore');
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
  });

  it('deleteDiaryEntry faz DELETE', async () => {
    const fetchMock = queueResponses({ status: 204 });
    await expect(deleteDiaryEntry('tok', 'e1')).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][0]).toBe('http://api.test/diary-entries/e1');
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });
});
