import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { DiaryEntryCard } from '@/components/diaryScreen/DiaryEntryCard';
import type { DiaryEntry } from '@/features/diaryScreen/diaryTypes';

const mockSession: { token: string | null } = { token: 'tok' };

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));

function makeEntry(overrides: Partial<DiaryEntry> = {}): DiaryEntry {
  return {
    id: 'e1',
    date: '2026-11-25',
    mood: 'FELIZ',
    note: 'Dia bom',
    photoUri: null,
    practiceTitle: null,
    ...overrides,
  };
}

function mockImageFetch({
  ok = true,
  contentType = 'image/png' as string | null,
  bytes = [104, 105],
} = {}) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok,
    headers: { get: () => contentType },
    arrayBuffer: () => Promise.resolve(new Uint8Array(bytes).buffer),
    blob: () => Promise.resolve(new Blob(['x'])),
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

const originalOS = Platform.OS;
const originalCreate = URL.createObjectURL;
const originalRevoke = URL.revokeObjectURL;

afterEach(() => {
  Platform.OS = originalOS;
  URL.createObjectURL = originalCreate;
  URL.revokeObjectURL = originalRevoke;
  mockSession.token = 'tok';
});

describe('DiaryEntryCard', () => {
  it('mostra emoção, nota e prática', async () => {
    await render(<DiaryEntryCard entry={makeEntry({ practiceTitle: 'Respiração' })} />);

    expect(screen.getByText('Feliz')).toBeTruthy();
    expect(screen.getByText('"Dia bom"')).toBeTruthy();
    expect(screen.getByText('Prática: Respiração')).toBeTruthy();
    expect(screen.queryByLabelText('Foto do registro')).toBeNull();
    // Sem onDelete não há menu de ações.
    expect(screen.queryByLabelText('Mais ações do registro')).toBeNull();
  });

  it('omite emoção e nota quando ausentes', async () => {
    await render(
      <DiaryEntryCard entry={makeEntry({ mood: null, note: null })} onDelete={jest.fn()} />,
    );

    expect(screen.queryByText('Feliz')).toBeNull();
    expect(screen.getByText('Obrigado por registrar como você está se sentindo.')).toBeTruthy();
    // Registro sem nota (só humor) não pode ser excluído pelo menu.
    expect(screen.queryByLabelText('Mais ações do registro')).toBeNull();
  });

  it('abre o menu e exclui o registro', async () => {
    const onDelete = jest.fn();
    const entry = makeEntry();
    await render(<DiaryEntryCard entry={entry} onDelete={onDelete} />);

    const toggle = screen.getByRole('button', { name: 'Mais ações do registro' });
    expect(screen.queryByText('Excluir registro')).toBeNull();

    await fireEvent.press(toggle);
    expect(toggle).toBeExpanded();
    await fireEvent.press(screen.getByText('Excluir registro'));

    expect(onDelete).toHaveBeenCalledWith(entry);
    expect(screen.queryByText('Excluir registro')).toBeNull();
  });

  it('o menu fecha ao tocar de novo no botão', async () => {
    await render(<DiaryEntryCard entry={makeEntry()} onDelete={jest.fn()} />);
    const toggle = screen.getByRole('button', { name: 'Mais ações do registro' });

    await fireEvent.press(toggle);
    await fireEvent.press(toggle);

    expect(screen.queryByText('Excluir registro')).toBeNull();
  });

  it('exibe foto local diretamente, sem baixar', async () => {
    const fetchMock = mockImageFetch();
    await render(<DiaryEntryCard entry={makeEntry({ photoUri: 'file:///local.jpg' })} />);

    expect(screen.getByLabelText('Foto do registro').props.source).toEqual({
      uri: 'file:///local.jpg',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('no nativo baixa a foto com o token e exibe como data URI', async () => {
    Platform.OS = 'android';
    const fetchMock = mockImageFetch({ bytes: [104, 105] });
    await render(<DiaryEntryCard entry={makeEntry({ photoUri: 'http://api.test/img/1' })} />);

    const image = await screen.findByLabelText('Foto do registro');
    expect(image.props.source).toEqual({ uri: 'data:image/png;base64,aGk=' });
    expect(fetchMock).toHaveBeenCalledWith('http://api.test/img/1', {
      headers: { Authorization: 'Bearer tok' },
    });
  });

  it('usa image/jpeg quando o content-type não vem', async () => {
    Platform.OS = 'ios';
    mockImageFetch({ contentType: null, bytes: [104, 105] });
    await render(<DiaryEntryCard entry={makeEntry({ photoUri: 'https://cdn/img' })} />);

    const image = await screen.findByLabelText('Foto do registro');
    expect(image.props.source).toEqual({ uri: 'data:image/jpeg;base64,aGk=' });
  });

  it('no web exibe via blob URL e revoga ao desmontar', async () => {
    Platform.OS = 'web';
    mockImageFetch();
    URL.createObjectURL = jest.fn(() => 'blob:photo');
    URL.revokeObjectURL = jest.fn();

    const { unmount } = await render(
      <DiaryEntryCard entry={makeEntry({ photoUri: 'http://api.test/img/1' })} />,
    );

    const image = await screen.findByLabelText('Foto do registro');
    expect(image.props.source).toEqual({ uri: 'blob:photo' });

    await unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo');
  });

  it('não exibe a foto quando o download falha', async () => {
    const fetchMock = mockImageFetch({ ok: false });
    await render(<DiaryEntryCard entry={makeEntry({ photoUri: 'http://api.test/img/1' })} />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByLabelText('Foto do registro')).toBeNull();
  });

  it('ignora erro de rede ao baixar a foto', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    await render(<DiaryEntryCard entry={makeEntry({ photoUri: 'http://api.test/img/1' })} />);

    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(screen.queryByLabelText('Foto do registro')).toBeNull();
  });

  it('não baixa a foto sem token', async () => {
    mockSession.token = null;
    const fetchMock = mockImageFetch();
    await render(<DiaryEntryCard entry={makeEntry({ photoUri: 'http://api.test/img/1' })} />);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Foto do registro')).toBeNull();
  });

  it('descarta o download se o card desmontar antes de terminar (nativo)', async () => {
    Platform.OS = 'android';
    let resolveBuffer: (value: ArrayBuffer) => void = () => {};
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'image/png' },
      arrayBuffer: () => new Promise<ArrayBuffer>((resolve) => (resolveBuffer = resolve)),
    }) as unknown as typeof fetch;

    const { unmount } = await render(
      <DiaryEntryCard entry={makeEntry({ photoUri: 'http://api.test/img/1' })} />,
    );
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await unmount();
    resolveBuffer(new Uint8Array([1]).buffer);
    await Promise.resolve();
  });

  it('descarta o download se o card desmontar antes de terminar (web)', async () => {
    Platform.OS = 'web';
    URL.createObjectURL = jest.fn(() => 'blob:photo');
    URL.revokeObjectURL = jest.fn();
    let resolveBlob: (value: Blob) => void = () => {};
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => new Promise<Blob>((resolve) => (resolveBlob = resolve)),
    }) as unknown as typeof fetch;

    const { unmount } = await render(
      <DiaryEntryCard entry={makeEntry({ photoUri: 'http://api.test/img/1' })} />,
    );
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    await unmount();
    resolveBlob(new Blob(['x']));
    await Promise.resolve();

    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('descarta a resposta que chega depois de desmontar', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    globalThis.fetch = jest.fn(
      () => new Promise((resolve) => (resolveFetch = resolve)),
    ) as unknown as typeof fetch;
    const { unmount } = await render(
      <DiaryEntryCard entry={makeEntry({ photoUri: 'http://api.test/img/1' })} />,
    );
    await unmount();
    resolveFetch({ ok: true });
    await Promise.resolve();
  });
});
