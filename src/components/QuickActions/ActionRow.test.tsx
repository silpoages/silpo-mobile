import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ActionButton } from '@/components/QuickActions/ActionButton';
import { ActionRow } from '@/components/QuickActions/ActionRow';

describe('ActionRow', () => {
  it('lista os exercícios rápidos e informa qual foi escolhido', async () => {
    const onSelectAction = jest.fn();
    await render(<ActionRow onSelectAction={onSelectAction} />);

    expect(screen.getByText('EXERCÍCIOS RÁPIDOS')).toBeOnTheScreen();
    expect(screen.getByText('3–5 min')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Respiração'));
    await fireEvent.press(screen.getByText('Meditação'));
    await fireEvent.press(screen.getByText('Um momento'));

    expect(onSelectAction.mock.calls).toEqual([['respire'], ['medite'], ['momento']]);
  });

  it('não quebra sem onSelectAction', async () => {
    await render(<ActionRow />);

    await fireEvent.press(screen.getByText('Respiração'));
    expect(screen.getByText('Respiração')).toBeOnTheScreen();
  });
});

describe('ActionButton', () => {
  it('mostra ícone, rótulo e tempo', async () => {
    const onPress = jest.fn();
    await render(
      <ActionButton label="Teste" time="1 min" icon={<Text>ico</Text>} onPress={onPress} />,
    );

    expect(screen.getByText('ico')).toBeOnTheScreen();
    expect(screen.getByText('1 min')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Teste'));
    expect(onPress).toHaveBeenCalled();
  });
});
