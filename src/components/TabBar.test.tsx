import { fireEvent, render, screen } from '@testing-library/react-native';

import { TabBar } from '@/components/TabBar';

describe('TabBar', () => {
  it('renderiza as 4 abas e marca a ativa', async () => {
    await render(<TabBar activeTab="jornada" onTabPress={jest.fn()} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
    expect(screen.getByRole('tab', { name: 'Jornada' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Home' })).not.toBeSelected();
    expect(screen.getByText('Diário')).toBeOnTheScreen();
    expect(screen.getByText('Apoio')).toBeOnTheScreen();
  });

  it('dispara o ripple e chama onTabPress com a aba tocada', async () => {
    const onTabPress = jest.fn();
    await render(<TabBar activeTab="home" onTabPress={onTabPress} />);

    const tab = screen.getByRole('tab', { name: 'Apoio' });
    await fireEvent(tab, 'pressIn', { nativeEvent: { locationX: 10, locationY: 20 } });
    await fireEvent.press(tab);

    expect(onTabPress).toHaveBeenCalledWith('apoio');
  });
});
