import { fireEvent, render, screen } from '@testing-library/react-native';

import { CalendarDay } from '@/components/diaryScreen/CalendarDay';

const baseProps = {
  isSelected: false,
  isToday: false,
  hasRecord: false,
  hasNote: false,
};

describe('CalendarDay', () => {
  it('renderiza uma célula vazia sem botão quando não há data', async () => {
    await render(<CalendarDay {...baseProps} date={null} onPress={jest.fn()} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('mostra o número do dia e chama onPress com a data', async () => {
    const onPress = jest.fn();
    const date = new Date(2026, 10, 25);
    await render(<CalendarDay {...baseProps} date={date} onPress={onPress} />);

    expect(screen.getByText('25')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: '25 de novembro' }));
    expect(onPress).toHaveBeenCalledWith(date);
  });

  it('descreve hoje e registro no rótulo acessível', async () => {
    await render(
      <CalendarDay
        {...baseProps}
        date={new Date(2026, 10, 25)}
        isToday
        hasRecord
        hasNote
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '25 de novembro, hoje, com registro' })).toBeTruthy();
  });

  it('marca o dia selecionado', async () => {
    await render(
      <CalendarDay
        {...baseProps}
        date={new Date(2026, 10, 3)}
        isSelected
        isToday
        hasRecord
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByRole('button')).toBeSelected();
  });
});
