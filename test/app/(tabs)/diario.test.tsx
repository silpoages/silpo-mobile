import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Animated } from 'react-native';

import DiaryRoute from '../../../app/(tabs)/diario';
import { prepareDiaryPhoto } from '@/features/diary/prepareDiaryPhoto';
import {
  createDiaryEntry,
  deleteDiaryEntry,
  getDiaryCalendar,
  listDiaryEntries,
  listMoodLogs,
  uploadDiaryImage,
} from '@/features/diaryScreen/diaryService';

// Telas inteiras demoram no primeiro render frio (transform + coverage); evita timeout espúrio.
jest.setTimeout(15000);

const mockSession: {
  token: string | null;
  user: { fullName: string; email: string } | null;
} = { token: 'tok', user: { fullName: 'Ana', email: 'ana@x.com' } };

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));

jest.mock('expo-file-system', () => ({ File: jest.fn() }));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
jest.mock('@/features/diary/prepareDiaryPhoto', () => ({ prepareDiaryPhoto: jest.fn() }));

jest.mock('@/features/diaryScreen/diaryService', () => ({
  ...jest.requireActual('@/features/diaryScreen/diaryService'),
  createDiaryEntry: jest.fn(),
  deleteDiaryEntry: jest.fn(),
  getDiaryCalendar: jest.fn(),
  listDiaryEntries: jest.fn(),
  listMoodLogs: jest.fn(),
  uploadDiaryImage: jest.fn(),
}));

const mockCalendar = getDiaryCalendar as jest.Mock;
const mockEntries = listDiaryEntries as jest.Mock;
const mockMoodLogs = listMoodLogs as jest.Mock;
const mockCreate = createDiaryEntry as jest.Mock;
const mockDelete = deleteDiaryEntry as jest.Mock;
const mockUpload = uploadDiaryImage as jest.Mock;
const mockPicker = ImagePicker.launchImageLibraryAsync as jest.Mock;
const mockPrepare = prepareDiaryPhoto as jest.Mock;

const todayEntry = {
  id: 'e1',
  date: '2026-11-25',
  mood: 'BEM',
  note: 'Hoje foi bom',
  photoUri: null,
  practiceTitle: null,
  moodLogId: 'm1',
};

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 10, 25, 12) });
  jest.spyOn(Animated, 'timing').mockImplementation(
    () =>
      ({
        start: (callback?: Animated.EndCallback) => callback?.({ finished: true }),
      }) as unknown as Animated.CompositeAnimation,
  );
  mockSession.token = 'tok';
  [mockCalendar, mockEntries, mockMoodLogs, mockCreate, mockDelete, mockUpload].forEach((m) =>
    m.mockReset(),
  );
  mockCalendar.mockResolvedValue([]);
  mockEntries.mockResolvedValue([]);
  mockMoodLogs.mockResolvedValue([]);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

async function renderLoaded() {
  await render(<DiaryRoute />);
  await waitFor(() => expect(screen.queryByText('Carregando seus registros...')).toBeNull());
}

describe('DiaryRoute', () => {
  it('busca calendário, registros e humores do mês e monta os cards do dia', async () => {
    mockEntries.mockResolvedValue([todayEntry]);
    mockMoodLogs.mockResolvedValue([
      { id: 'm1', mood: 'BEM', posted_at: 'x' },
      { id: 'm2', mood: 'TRISTE', posted_at: 'y' },
    ]);
    mockCalendar.mockResolvedValue([
      { date: '2026-11-25', entriesCount: 1, moods: ['BEM'] },
      { date: '2026-11-10', entriesCount: 0, moods: ['FELIZ'] },
      { date: '2026-11-12', entriesCount: 0, moods: [] },
      { date: '2026-11-14', entriesCount: 2, moods: [] },
    ]);

    await renderLoaded();

    expect(mockCalendar).toHaveBeenCalledWith('tok', '2026-11');
    expect(mockEntries).toHaveBeenCalledWith('tok', '2026-11-01', '2026-11-30');
    expect(mockMoodLogs).toHaveBeenCalledWith('tok', '2026-11-25');

    expect(screen.getByText('"Hoje foi bom"')).toBeTruthy();
    // m1 já está ligado ao relato; só m2 vira card de humor.
    expect(screen.getByText('Triste')).toBeTruthy();
    expect(screen.getAllByText('Obrigado por registrar como você está se sentindo.')).toHaveLength(
      2,
    );

    // Dias só com humor ou com registros viram marcadores no calendário.
    expect(screen.getByRole('button', { name: '10 de novembro, com registro' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '14 de novembro, com registro' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '12 de novembro' })).toBeTruthy();
  });

  it('mostra um marcador clicável para dias com humor, sem card de relato', async () => {
    mockCalendar.mockResolvedValue([{ date: '2026-11-10', entriesCount: 0, moods: ['FELIZ'] }]);
    await renderLoaded();

    await fireEvent.press(screen.getByRole('button', { name: '10 de novembro, com registro' }));
    await waitFor(() => expect(mockMoodLogs).toHaveBeenLastCalledWith('tok', '2026-11-10'));
    await waitFor(() => expect(screen.getByText('Feliz')).toBeTruthy());
  });

  it('marca o dia selecionado como coberto quando só há humor avulso', async () => {
    mockMoodLogs.mockResolvedValue([{ id: 'm9', mood: 'ANSIOSO', posted_at: 'x' }]);
    mockCalendar.mockResolvedValue([{ date: '2026-11-25', entriesCount: 0, moods: ['ANSIOSO'] }]);
    await renderLoaded();

    // Só um card (o do humor avulso), sem marcador duplicado.
    expect(screen.getAllByText('Ansioso')).toHaveLength(1);
  });

  it('sem sessão mostra o diário vazio sem chamar a API', async () => {
    mockSession.token = null;
    await renderLoaded();

    expect(screen.getByText('Nenhum registro por aqui ainda.')).toBeTruthy();
    expect(mockCalendar).not.toHaveBeenCalled();
  });

  it('mostra erro e recarrega ao tentar de novo', async () => {
    mockCalendar.mockRejectedValueOnce(new Error('offline'));
    await renderLoaded();

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar seus registros');
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));

    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(mockCalendar).toHaveBeenCalledTimes(2);
  });

  it('busca de novo ao trocar de mês', async () => {
    await renderLoaded();

    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));

    await waitFor(() => expect(mockCalendar).toHaveBeenLastCalledWith('tok', '2026-12'));
    expect(mockEntries).toHaveBeenLastCalledWith('tok', '2026-12-01', '2026-12-31');
    expect(mockMoodLogs).toHaveBeenLastCalledWith('tok', '2026-12-01');
  });

  it('cria um registro com foto e recarrega', async () => {
    mockPicker.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///orig.jpg', width: 10, height: 10 }],
    });
    mockPrepare.mockResolvedValue('file:///small.jpg');
    mockUpload.mockResolvedValue('key.jpg');
    mockCreate.mockResolvedValue({});
    await renderLoaded();

    await fireEvent.press(screen.getByText('Criar meu primeiro registro →'));
    await fireEvent.press(screen.getByText('Adicionar foto'));
    await screen.findByLabelText('Foto escolhida para o relato');
    await fireEvent.changeText(screen.getByLabelText('Como foi o seu dia'), 'Novo relato');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(mockUpload).toHaveBeenCalledWith('tok', 'file:///small.jpg');
    expect(mockCreate).toHaveBeenCalledWith('tok', {
      note: 'Novo relato',
      entryDate: '2026-11-25',
      mood: null,
      imageUrl: 'key.jpg',
    });
    await waitFor(() => expect(mockCalendar).toHaveBeenCalledTimes(2));
    expect(screen.queryByLabelText('Como foi o seu dia')).toBeNull();
  });

  it('cria um registro sem foto', async () => {
    mockEntries.mockResolvedValue([todayEntry]);
    mockCreate.mockResolvedValue({});
    await renderLoaded();

    await fireEvent.press(screen.getByText('Adicionar registro'));
    await fireEvent.changeText(screen.getByLabelText('Como foi o seu dia'), 'Mais um');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith('tok', expect.objectContaining({ imageUrl: null }));
  });

  it('não salva sem sessão e mantém o relato no formulário', async () => {
    mockSession.token = null;
    await renderLoaded();

    await fireEvent.press(screen.getByText('Criar meu primeiro registro →'));
    await fireEvent.changeText(screen.getByLabelText('Como foi o seu dia'), 'Relato');
    await fireEvent.press(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      screen.getByText('Não foi possível salvar agora. Seu relato continua aqui, tente de novo.'),
    ).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Agora não' }));
    expect(screen.queryByLabelText('Como foi o seu dia')).toBeNull();
  });

  describe('exclusão', () => {
    async function openDeleteDialog() {
      mockEntries.mockResolvedValue([todayEntry]);
      await renderLoaded();
      await fireEvent.press(screen.getByRole('button', { name: 'Mais ações do registro' }));
      await fireEvent.press(screen.getByText('Excluir registro'));
      expect(screen.getByText('Excluir registro?')).toBeTruthy();
    }

    it('exclui o registro e recarrega', async () => {
      mockDelete.mockResolvedValue(undefined);
      await openDeleteDialog();

      await fireEvent.press(screen.getByText('Excluir'));

      expect(mockDelete).toHaveBeenCalledWith('tok', 'e1');
      await waitFor(() => expect(screen.queryByText('Excluir registro?')).toBeNull());
      expect(mockCalendar).toHaveBeenCalledTimes(2);
    });

    it('mostra erro quando a exclusão falha', async () => {
      mockDelete.mockRejectedValue(new Error('x'));
      await openDeleteDialog();

      await fireEvent.press(screen.getByText('Excluir'));

      expect(
        await screen.findByText('Não foi possível excluir. O registro continua aqui.'),
      ).toBeTruthy();
      expect(screen.getByText('Excluir registro?')).toBeTruthy();
    });

    it('cancela pelo botão e pelo voltar do Android', async () => {
      await openDeleteDialog();

      await fireEvent.press(screen.getByText('Cancelar'));
      expect(screen.queryByText('Excluir registro?')).toBeNull();

      await fireEvent.press(screen.getByRole('button', { name: 'Mais ações do registro' }));
      await fireEvent.press(screen.getByText('Excluir registro'));
      const modal = screen.container
        .queryAll((node) => node.type === 'Modal')
        .find((node) => node.props.animationType === 'fade');
      await act(async () => modal?.props.onRequestClose());

      expect(screen.queryByText('Excluir registro?')).toBeNull();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('não fecha nem exclui de novo enquanto exclui', async () => {
      let resolveDelete: () => void = () => {};
      mockDelete.mockImplementation(() => new Promise<void>((r) => (resolveDelete = r)));
      await openDeleteDialog();

      await fireEvent.press(screen.getByText('Excluir'));
      expect(screen.getByText('Excluindo...')).toBeTruthy();

      const modal = screen.container
        .queryAll((node) => node.type === 'Modal')
        .find((node) => node.props.animationType === 'fade');
      await act(async () => modal?.props.onRequestClose());
      expect(screen.getByText('Excluir registro?')).toBeTruthy();

      await fireEvent.press(screen.getByText('Excluindo...'));
      expect(mockDelete).toHaveBeenCalledTimes(1);

      await act(async () => resolveDelete());
      await waitFor(() => expect(screen.queryByText('Excluir registro?')).toBeNull());
    });
  });

  it('descarta respostas que chegam depois de sair da tela', async () => {
    let resolveCalendar: (value: unknown) => void = () => {};
    mockCalendar.mockImplementationOnce(() => new Promise((r) => (resolveCalendar = r)));
    const first = await render(<DiaryRoute />);
    await first.unmount();
    await act(async () => resolveCalendar([]));

    let rejectCalendar: (error: Error) => void = () => {};
    mockCalendar.mockImplementationOnce(() => new Promise((_, r) => (rejectCalendar = r)));
    const second = await render(<DiaryRoute />);
    await second.unmount();
    await act(async () => rejectCalendar(new Error('x')));

    expect(mockCalendar).toHaveBeenCalledTimes(2);
  });
});
