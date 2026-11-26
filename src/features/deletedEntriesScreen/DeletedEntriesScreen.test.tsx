import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import { DeletedEntriesScreen } from '@/features/deletedEntriesScreen/DeletedEntriesScreen';
import {
  listDeletedDiaryEntries,
  restoreDiaryEntry,
  type DeletedDiaryEntry,
} from '@/features/diaryScreen/diaryService';

// Telas inteiras demoram no primeiro render frio (transform + coverage); evita timeout espúrio.
jest.setTimeout(15000);

const mockSession: { token: string | null } = { token: 'tok' };

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));

jest.mock('@/features/diaryScreen/diaryService', () => ({
  listDeletedDiaryEntries: jest.fn(),
  restoreDiaryEntry: jest.fn(),
}));

const mockList = listDeletedDiaryEntries as jest.Mock;
const mockRestore = restoreDiaryEntry as jest.Mock;

function makeEntry(overrides: Partial<DeletedDiaryEntry> = {}): DeletedDiaryEntry {
  return {
    id: 'd1',
    date: '2026-11-01',
    mood: 'FELIZ',
    note: 'Relato apagado',
    hadPhoto: false,
    practiceTitle: null,
    deletedAt: '2026-11-20T15:00:00',
    ...overrides,
  };
}

beforeEach(() => {
  mockSession.token = 'tok';
  mockList.mockReset();
  mockRestore.mockReset();
});

describe('DeletedEntriesScreen', () => {
  it('lista os registros apagados com data, humor, prática e aviso de foto', async () => {
    mockList.mockResolvedValue([
      makeEntry({ practiceTitle: 'Respiração', hadPhoto: true }),
      makeEntry({ id: 'd2', mood: null, note: 'Sem humor' }),
    ]);
    await render(<DeletedEntriesScreen />);

    expect(await screen.findByText('"Relato apagado"')).toBeTruthy();
    expect(mockList).toHaveBeenCalledWith('tok');
    expect(screen.getByRole('header', { name: 'Mensagens apagadas' })).toBeTruthy();
    expect(screen.getAllByText('Domingo, 1 de novembro')).toHaveLength(2);
    expect(screen.getByText('Feliz · Apagado em 20/11/2026')).toBeTruthy();
    expect(screen.getByText('Apagado em 20/11/2026')).toBeTruthy();
    expect(screen.getByText('Prática: Respiração')).toBeTruthy();
    expect(screen.getAllByText('A foto deste registro foi apagada e não volta.')).toHaveLength(1);
  });

  it('mostra o estado vazio', async () => {
    mockList.mockResolvedValue([]);
    await render(<DeletedEntriesScreen />);

    expect(await screen.findByText('Nenhum registro apagado')).toBeTruthy();
  });

  it('mostra erro de carregamento e tenta de novo', async () => {
    mockList.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([makeEntry()]);
    await render(<DeletedEntriesScreen />);

    expect(
      await screen.findByText('Não foi possível carregar os registros apagados.'),
    ).toBeTruthy();
    await fireEvent.press(screen.getByText('Tentar novamente'));

    expect(await screen.findByText('"Relato apagado"')).toBeTruthy();
    expect(mockList).toHaveBeenCalledTimes(2);
  });

  it('não busca nada sem sessão', async () => {
    mockSession.token = null;
    await render(<DeletedEntriesScreen />);

    expect(mockList).not.toHaveBeenCalled();
  });

  it('restaura um registro e remove da lista', async () => {
    mockList.mockResolvedValue([makeEntry(), makeEntry({ id: 'd2', note: 'Fica' })]);
    mockRestore.mockResolvedValue(undefined);
    await render(<DeletedEntriesScreen />);

    const [restoreButton] = await screen.findAllByText('Restaurar');
    await fireEvent.press(restoreButton);

    expect(mockRestore).toHaveBeenCalledWith('tok', 'd1');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Registro restaurado. Ele já está de volta no diário.',
    );
    expect(screen.queryByText('"Relato apagado"')).toBeNull();
    expect(screen.getByText('"Fica"')).toBeTruthy();
  });

  it('avisa quando a restauração falha e mantém o registro', async () => {
    mockList.mockResolvedValue([makeEntry()]);
    mockRestore.mockRejectedValue(new Error('x'));
    await render(<DeletedEntriesScreen />);

    await fireEvent.press(await screen.findByText('Restaurar'));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível restaurar agora. Tente novamente.',
    );
    expect(screen.getByText('"Relato apagado"')).toBeTruthy();
  });

  it('bloqueia outras restaurações enquanto uma está em andamento', async () => {
    mockList.mockResolvedValue([makeEntry(), makeEntry({ id: 'd2', note: 'Outro' })]);
    let resolveRestore: () => void = () => {};
    mockRestore.mockImplementation(() => new Promise<void>((r) => (resolveRestore = r)));
    await render(<DeletedEntriesScreen />);

    const [first] = await screen.findAllByText('Restaurar');
    const pending = fireEvent.press(first);
    await waitFor(() => expect(mockRestore).toHaveBeenCalledTimes(1));

    // O outro card fica desabilitado; mesmo um toque forçado não dispara nova restauração.
    const buttons = screen.getAllByRole('button', { name: /^Restaurar registro de/ });
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button).toBeDisabled());

    await act(async () => {
      resolveRestore();
      await pending;
    });
    expect(mockRestore).toHaveBeenCalledTimes(1);
  });

  it('volta pela pilha ou navega para o perfil', async () => {
    mockList.mockResolvedValue([]);
    await render(<DeletedEntriesScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.back).toHaveBeenCalled();

    mockRouter.canGoBack.mockReturnValue(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Voltar' }));
    expect(mockRouter.navigate).toHaveBeenCalledWith('/perfil');
  });

  it('ignora respostas que chegam depois de desmontar', async () => {
    let resolveList: (items: DeletedDiaryEntry[]) => void = () => {};
    mockList.mockImplementationOnce(() => new Promise((r) => (resolveList = r)));
    const { unmount } = await render(<DeletedEntriesScreen />);
    await unmount();
    await act(async () => resolveList([makeEntry()]));

    let rejectList: (error: Error) => void = () => {};
    mockList.mockImplementationOnce(() => new Promise((_, r) => (rejectList = r)));
    const second = await render(<DeletedEntriesScreen />);
    await second.unmount();
    await act(async () => rejectList(new Error('x')));
  });
});
