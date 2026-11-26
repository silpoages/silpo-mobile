import { render, renderHook, screen } from '@testing-library/react-native';

import ExampleCard from '@/components/ExampleCard';
import ExampleScreen from '@/features/example/ExampleScreen';
import { useExampleItem } from '@/hooks/useExampleItem';

describe('ExampleCard', () => {
  it('mostra o kicker, o título e a descrição', async () => {
    await render(<ExampleCard title="Título" description="Descrição" />);

    expect(screen.getByText('TEMPLATE')).toBeTruthy();
    expect(screen.getByText('Título')).toBeTruthy();
    expect(screen.getByText('Descrição')).toBeTruthy();
  });
});

describe('useExampleItem', () => {
  it('memoiza o item entre renders', async () => {
    const { result, rerender } = await renderHook(() => useExampleItem());
    const first = result.current;
    await rerender({});
    expect(result.current).toBe(first);
    expect(first.id).toBe('template');
  });
});

describe('ExampleScreen', () => {
  it('renderiza o card com o item do template', async () => {
    await render(<ExampleScreen />);
    expect(screen.getByText('Template de tela')).toBeTruthy();
  });
});
