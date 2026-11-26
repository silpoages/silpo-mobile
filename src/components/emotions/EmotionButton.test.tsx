import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { EmotionButton } from '@/components/emotions/EmotionButton';
import { EMOTIONS } from '@/components/emotions/emotionConfig';

describe('EmotionButton', () => {
  it('mostra emoji e rótulo e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<EmotionButton label="Feliz" emoji={<Text>:)</Text>} onPress={onPress} />);

    expect(screen.getByText(':)')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: /Feliz/ }));
    expect(onPress).toHaveBeenCalled();
  });

  it('marca selecionado', async () => {
    await render(<EmotionButton label="Bem" emoji={null} onPress={jest.fn()} isSelected />);

    expect(screen.getByRole('button')).toBeSelected();
  });

  it('não chama onPress quando desabilitado', async () => {
    const onPress = jest.fn();
    await render(<EmotionButton label="Bem" emoji={null} onPress={onPress} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('EMOTIONS', () => {
  it('tem as 6 emoções com ids únicos', () => {
    expect(EMOTIONS.map((emotion) => emotion.id)).toEqual([
      'FELIZ',
      'BEM',
      'CANSADO',
      'TRISTE',
      'ANSIOSO',
      'IRRITADO',
    ]);
  });
});
