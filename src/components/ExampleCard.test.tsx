import { render, screen } from '@testing-library/react-native';

import ExampleCard from '@/components/ExampleCard';

describe('ExampleCard', () => {
  it('mostra título e descrição', async () => {
    await render(<ExampleCard title="Título" description="Descrição" />);

    expect(screen.getByText('TEMPLATE')).toBeOnTheScreen();
    expect(screen.getByText('Título')).toBeOnTheScreen();
    expect(screen.getByText('Descrição')).toBeOnTheScreen();
  });
});
