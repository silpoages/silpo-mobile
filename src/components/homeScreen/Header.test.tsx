import { fireEvent, render, screen } from '@testing-library/react-native';

import { Header } from '@/components/homeScreen/Header';

function setHour(hour: number) {
  jest.useFakeTimers({ now: new Date(2026, 0, 15, hour, 0, 0) });
}

afterEach(() => {
  jest.useRealTimers();
});

describe('Header (home)', () => {
  it.each([
    [8, 'Bom dia, Ana'],
    [14, 'Boa tarde, Ana'],
    [20, 'Boa noite, Ana'],
  ])('às %ih saúda com "%s"', async (hour, greeting) => {
    setHour(hour);
    await render(<Header userName="Ana" subtitle="Seus sentimentos importam" />);

    expect(screen.getByText(greeting)).toBeOnTheScreen();
    expect(screen.getByText('Seus sentimentos importam')).toBeOnTheScreen();
  });

  it('mostra a inicial no avatar e abre o perfil', async () => {
    const onPressAvatar = jest.fn();
    await render(<Header userName="ana" subtitle="x" onPressAvatar={onPressAvatar} />);

    const avatar = screen.getByRole('button', { name: 'Abrir perfil' });
    expect(avatar).toHaveTextContent('A');
    await fireEvent.press(avatar);
    expect(onPressAvatar).toHaveBeenCalled();
  });
});
