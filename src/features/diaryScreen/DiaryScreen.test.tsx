import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import { DiaryScreen } from '@/features/diaryScreen/DiaryScreen';
import type { DiaryEntry } from '@/features/diaryScreen/diaryTypes';

// Telas inteiras demoram no primeiro render frio (transform + coverage); evita timeout espúrio.
jest.setTimeout(15000);

type MockUser = { fullName: string | null; email: string } | null;
const mockSession: { token: string; user: MockUser } = {
  token: 'tok',
  user: { fullName: 'Ana Souza', email: 'ana@x.com' },
};

jest.mock('@/features/auth/session/SessionContext', () => ({
  useSession: () => mockSession,
}));

function makeEntry(overrides: Partial<DiaryEntry> = {}): DiaryEntry {
  return {
    id: 'e1',
    date: '2026-11-25',
    mood: 'BEM',
    note: 'Hoje foi bom',
    photoUri: null,
    practiceTitle: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 10, 25, 12) });
  mockSession.user = { fullName: 'Ana Souza', email: 'ana@x.com' };
});

afterEach(() => {
  jest.useRealTimers();
});

describe('DiaryScreen', () => {
  it('mostra os registros do dia selecionado (hoje) e o botão de adicionar', async () => {
    const onAddEntry = jest.fn();
    await render(
      <DiaryScreen
        entries={[makeEntry(), makeEntry({ id: 'e2', date: '2026-11-03', note: 'Outro dia' })]}
        onAddEntry={onAddEntry}
      />,
    );

    expect(screen.getByRole('header', { name: 'Diário' })).toBeTruthy();
    expect(screen.getByText('"Hoje foi bom"')).toBeTruthy();
    expect(screen.queryByText('"Outro dia"')).toBeNull();

    await fireEvent.press(screen.getByText('Adicionar registro'));
    expect(onAddEntry).toHaveBeenCalledWith(new Date(2026, 10, 25, 12));
  });

  it('abre o perfil pelo avatar com a inicial do nome', async () => {
    await render(<DiaryScreen entries={[]} />);

    expect(screen.getByText('A')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Abrir perfil' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/perfil');
  });

  it('usa o e-mail quando não há nome, e vazio sem usuário', async () => {
    mockSession.user = { fullName: '  ', email: 'zeca@x.com' };
    const { rerender } = await render(<DiaryScreen entries={[]} />);
    expect(screen.getByText('Z')).toBeTruthy();

    mockSession.user = null;
    await rerender(<DiaryScreen entries={[]} />);
    expect(screen.getByRole('button', { name: 'Abrir perfil' })).toBeTruthy();
  });

  it('mostra o estado vazio sem o botão do rodapé', async () => {
    const onAddEntry = jest.fn();
    await render(<DiaryScreen entries={[]} onAddEntry={onAddEntry} />);

    expect(screen.queryByText('Adicionar registro')).toBeNull();
    await fireEvent.press(screen.getByText('Criar meu primeiro registro →'));
    expect(onAddEntry).toHaveBeenCalledTimes(1);
  });

  it('funciona sem callbacks opcionais', async () => {
    await render(<DiaryScreen entries={[makeEntry()]} />);

    await fireEvent.press(screen.getByText('Adicionar registro'));
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));
    await fireEvent.press(screen.getByRole('button', { name: '2 de dezembro' }));

    expect(screen.getByRole('header', { name: 'Dezembro 2026' })).toBeTruthy();
  });

  it('mostra carregamento', async () => {
    await render(<DiaryScreen entries={[]} isLoading />);

    expect(screen.getByText('Carregando seus registros...')).toBeTruthy();
    expect(screen.queryByText('Nenhum registro por aqui ainda.')).toBeNull();
    expect(screen.getByText('Adicionar registro')).toBeTruthy();
  });

  it('mostra erro com e sem botão de tentar de novo', async () => {
    const onRetry = jest.fn();
    const { rerender } = await render(<DiaryScreen entries={[]} hasError onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar seus registros');
    await fireEvent.press(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    await rerender(<DiaryScreen entries={[]} hasError />);
    expect(screen.queryByText('Tentar de novo')).toBeNull();
  });

  it('troca de mês selecionando o dia 1 e volta para hoje no mês corrente', async () => {
    const onMonthChange = jest.fn();
    const onSelectDate = jest.fn();
    await render(
      <DiaryScreen entries={[]} onMonthChange={onMonthChange} onSelectDate={onSelectDate} />,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    expect(screen.getByRole('header', { name: 'Outubro 2026' })).toBeTruthy();
    expect(onMonthChange).toHaveBeenLastCalledWith({ year: 2026, month: 9 });
    expect(onSelectDate).toHaveBeenLastCalledWith(new Date(2026, 9, 1));
    expect(screen.getByRole('button', { name: '1 de outubro' })).toBeSelected();

    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));
    expect(onMonthChange).toHaveBeenLastCalledWith({ year: 2026, month: 10 });
    expect(onSelectDate).toHaveBeenLastCalledWith(new Date(2026, 10, 25, 12));
  });

  it('seleciona outro dia e mostra os registros dele, repassando a exclusão', async () => {
    const onSelectDate = jest.fn();
    const onDeleteEntry = jest.fn();
    const other = makeEntry({ id: 'e2', date: '2026-11-03', note: 'Outro dia' });
    await render(
      <DiaryScreen
        entries={[makeEntry(), other]}
        onSelectDate={onSelectDate}
        onDeleteEntry={onDeleteEntry}
      />,
    );

    await fireEvent.press(screen.getByRole('button', { name: '3 de novembro, com registro' }));

    expect(onSelectDate).toHaveBeenCalledWith(new Date(2026, 10, 3));
    expect(screen.getByText('"Outro dia"')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Mais ações do registro' }));
    await fireEvent.press(screen.getByText('Excluir registro'));
    expect(onDeleteEntry).toHaveBeenCalledWith(other);
  });
});
