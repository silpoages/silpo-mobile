import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';

describe('ScreenContainer', () => {
  it('renderiza os filhos com o fundo padrão', async () => {
    await render(
      <ScreenContainer>
        <Text>conteúdo</Text>
      </ScreenContainer>,
    );

    expect(screen.getByText('conteúdo')).toBeOnTheScreen();
  });

  it('aceita fundo e estilo de conteúdo customizados', async () => {
    await render(
      <ScreenContainer background="#000" contentStyle={{ padding: 4 }}>
        <Text>custom</Text>
      </ScreenContainer>,
    );

    expect(screen.getByText('custom')).toBeOnTheScreen();
  });
});
