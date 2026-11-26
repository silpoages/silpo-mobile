import { fireEvent, render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import { OnboardingHeader } from '@/components/onboarding/OnboardingHeader';
import { ProgressBar } from '@/components/onboarding/ProgressBar';

describe('ProgressBar', () => {
  it.each([
    [2, 4, '50%'],
    [4, 4, '100%'],
    [6, 4, '100%'],
    [-1, 4, '0%'],
  ])('step %p de %p preenche %p', async (step, total, width) => {
    await render(
      <View testID="progress">
        <ProgressBar step={step} totalSteps={total} />
      </View>,
    );
    const track = screen.getByTestId('progress').children[0] as { children: unknown[] };
    const fill = track.children[0] as { props: { style: unknown } };
    const style = ([] as unknown[]).concat(fill.props.style) as { width?: unknown }[];
    expect(style.find((entry) => entry && 'width' in entry)?.width).toBe(width);
  });
});

describe('OnboardingHeader', () => {
  it('mostra "N de 4" sem botão de voltar na primeira etapa', async () => {
    await render(<OnboardingHeader step={2} />);
    expect(screen.getByText('2 de 4')).toBeTruthy();
    expect(screen.queryByTestId('back-button')).toBeNull();
  });

  it('mostra o botão de voltar quando há handler', async () => {
    const onPressBack = jest.fn();
    await render(<OnboardingHeader onPressBack={onPressBack} step={3} />);

    expect(screen.getByText('3 de 4')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('back-button'));
    expect(onPressBack).toHaveBeenCalledTimes(1);
  });
});
