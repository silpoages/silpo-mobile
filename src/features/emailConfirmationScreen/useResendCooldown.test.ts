import { act, renderHook } from '@testing-library/react-native';

import { useResendCooldown } from '@/features/emailConfirmationScreen/useResendCooldown';

describe('useResendCooldown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('conta regressivamente até zero e libera o reenvio', async () => {
    const { result } = await renderHook(() => useResendCooldown(2));

    expect(result.current).toMatchObject({ secondsLeft: 2, isCoolingDown: true });

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toBe(1);

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current).toMatchObject({ secondsLeft: 0, isCoolingDown: false });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBe(0);
  });

  it('restart volta a contagem para o início', async () => {
    const { result } = await renderHook(() => useResendCooldown(1));

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.isCoolingDown).toBe(false);

    await act(async () => {
      result.current.restart();
    });
    expect(result.current).toMatchObject({ secondsLeft: 1, isCoolingDown: true });
  });

  it('começa liberado quando o tempo é zero', async () => {
    const { result } = await renderHook(() => useResendCooldown(0));

    expect(result.current.isCoolingDown).toBe(false);
  });
});
