import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { AchievementToast } from './AchievementToast';

describe('AchievementToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('anuncia a conquista e mostra nome e rótulo', async () => {
    await render(<AchievementToast name="Primeiro passo" icon="trophy" onDismiss={jest.fn()} />);

    expect(screen.getByText('Nova conquista')).toBeOnTheScreen();
    expect(screen.getByText('Primeiro passo')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Nova conquista: Primeiro passo' }),
    ).toBeOnTheScreen();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Nova conquista: Primeiro passo',
    );
  });

  it('some sozinho depois do tempo de exibição', async () => {
    const onDismiss = jest.fn();
    await render(<AchievementToast name="A" icon="nao-existe" onDismiss={onDismiss} />);

    await act(async () => {
      jest.advanceTimersByTime(3999);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(1 + 300);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('fecha ao tocar, uma vez só, mesmo com toques repetidos ou o tempo acabando', async () => {
    const onDismiss = jest.fn();
    await render(<AchievementToast name="A" icon="trophy" onDismiss={onDismiss} />);

    const button = screen.getByRole('button');
    await fireEvent.press(button);
    await fireEvent.press(button);
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('cancela o fechamento automático ao desmontar', async () => {
    const onDismiss = jest.fn();
    const { unmount } = await render(
      <AchievementToast name="A" icon="trophy" onDismiss={onDismiss} />,
    );

    await unmount();
    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
