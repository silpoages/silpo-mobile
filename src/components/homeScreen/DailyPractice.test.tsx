import { fireEvent, render, screen } from '@testing-library/react-native';

import { DailyPractice } from '@/components/homeScreen/DailyPractice';

describe('DailyPractice', () => {
  it('mostra a prática e os dois botões', async () => {
    const onPressStart = jest.fn();
    const onPressSeeOthers = jest.fn();
    await render(
      <DailyPractice
        title="Gratidão"
        description="Agradeça"
        onPressStart={onPressStart}
        onPressSeeOthers={onPressSeeOthers}
      />,
    );

    expect(screen.getByText('PRÁTICA DO DIA')).toBeOnTheScreen();
    expect(screen.getByText('Gratidão')).toBeOnTheScreen();
    expect(screen.getByText('Agradeça')).toBeOnTheScreen();
    expect(screen.queryByText('Prática concluída hoje')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Quero tentar'));
    await fireEvent.press(screen.getByText('Ver outras'));
    expect(onPressStart).toHaveBeenCalled();
    expect(onPressSeeOthers).toHaveBeenCalled();
  });

  it('mostra o selo e "Ver prática" quando já concluída', async () => {
    await render(
      <DailyPractice title="T" description="D" completedToday onPressStart={jest.fn()} />,
    );

    expect(screen.getByText('Prática concluída hoje')).toBeOnTheScreen();
    expect(screen.getByText('Ver prática')).toBeOnTheScreen();
  });

  it('esconde o botão principal sem onPressStart', async () => {
    await render(<DailyPractice title="T" description="D" />);

    expect(screen.queryByText('Quero tentar')).not.toBeOnTheScreen();
    expect(screen.getByText('Ver outras')).toBeOnTheScreen();
  });
});
