import { fireEvent, render, screen } from '@testing-library/react-native';
import { Animated, StyleSheet } from 'react-native';

import { BreathBall } from '@/components/breathingScreen/BreathBall';
import { EndPracticeButton } from '@/components/breathingScreen/EndPracticeButton';
import { PauseButton } from '@/components/breathingScreen/PauseButton';
import { PracticeModalButton } from '@/components/breathingScreen/PracticeModalButton';
import { colors } from '@/theme';

jest.mock('@expo/vector-icons/Feather', () => {
  const { Text } = jest.requireActual('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name: string }) => <Text>{`icon:${name}`}</Text>,
  };
});

type JsonNode = { props: { style?: unknown } };

describe('BreathBall', () => {
  it('desenha um círculo do tamanho informado com a cor padrão', async () => {
    const { toJSON } = await render(<BreathBall size={100} />);
    const style = StyleSheet.flatten((toJSON() as JsonNode).props.style) as Record<string, unknown>;

    expect(style).toMatchObject({
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary,
    });
  });

  it('aceita cor e escala animada', async () => {
    const scale = new Animated.Value(0.5);
    const { toJSON } = await render(<BreathBall size={60} color="#123456" scale={scale} />);
    const style = StyleSheet.flatten((toJSON() as JsonNode).props.style) as Record<string, unknown>;

    expect(style).toMatchObject({ backgroundColor: '#123456', borderRadius: 30 });
  });
});

describe('EndPracticeButton', () => {
  it('mostra o rótulo padrão e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<EndPracticeButton onPress={onPress} />);

    await fireEvent.press(screen.getByText('Encerrar Prática'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('aceita rótulo customizado e destaque', async () => {
    await render(<EndPracticeButton onPress={jest.fn()} label="Encerrar" emphasized />);

    expect(screen.getByText('Encerrar')).toBeTruthy();
  });
});

describe('PauseButton', () => {
  it('mostra o ícone de play quando pausado', async () => {
    const onPress = jest.fn();
    await render(<PauseButton paused onPress={onPress} />);

    await fireEvent.press(screen.getByText('icon:play'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('mostra o ícone de pausa quando tocando', async () => {
    await render(<PauseButton paused={false} onPress={jest.fn()} />);

    expect(screen.getByText('icon:pause')).toBeTruthy();
  });
});

describe('PracticeModalButton', () => {
  it('abre o guia ao tocar', async () => {
    const onPress = jest.fn();
    await render(<PracticeModalButton onPress={onPress} />);

    await fireEvent.press(screen.getByText('icon:more-horizontal'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
