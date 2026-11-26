import { fireEvent, render, screen } from '@testing-library/react-native';

import { MonthlyCalendar } from '@/components/diaryScreen/MonthlyCalendar';

describe('MonthlyCalendar', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: new Date(2026, 10, 25, 12) });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function renderCalendar() {
    const handlers = {
      onPreviousMonth: jest.fn(),
      onNextMonth: jest.fn(),
      onSelectDate: jest.fn(),
    };
    await render(
      <MonthlyCalendar
        month={{ year: 2026, month: 10 }}
        selectedDate={new Date(2026, 10, 10)}
        recordDates={new Set(['2026-11-05', '2026-11-25'])}
        noteDates={new Set(['2026-11-05'])}
        {...handlers}
      />,
    );
    return handlers;
  }

  it('mostra o título do mês e os dias, marcando hoje, registros e seleção', async () => {
    await renderCalendar();

    expect(screen.getByRole('header', { name: 'Novembro 2026' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '5 de novembro, com registro' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '25 de novembro, hoje, com registro' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '10 de novembro' })).toBeSelected();
    // 30 dias de novembro viram 30 botões de dia + 2 de navegação.
    expect(screen.getAllByRole('button')).toHaveLength(32);
  });

  it('navega entre meses e seleciona um dia', async () => {
    const handlers = await renderCalendar();

    await fireEvent.press(screen.getByRole('button', { name: 'Mês anterior' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Próximo mês' }));
    await fireEvent.press(screen.getByRole('button', { name: '12 de novembro' }));

    expect(handlers.onPreviousMonth).toHaveBeenCalledTimes(1);
    expect(handlers.onNextMonth).toHaveBeenCalledTimes(1);
    expect(handlers.onSelectDate).toHaveBeenCalledWith(new Date(2026, 10, 12));
  });
});
