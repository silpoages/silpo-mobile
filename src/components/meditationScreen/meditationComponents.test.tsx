import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { mockRouter } from '@test/mocks/expoRouter';

import MeditationCard from '@/components/meditationScreen/MeditationCard';
import { MeditationHeader } from '@/components/meditationScreen/MeditationHeader';
import { MeditationSelection } from '@/components/meditationScreen/MeditationSelection';
import NoMeditationCard from '@/components/meditationScreen/NoMeditationCard';
import { PlaybackErrorCard } from '@/components/meditationScreen/PlaybackErrorCard';
import { PlayerButton } from '@/components/meditationScreen/PlayerButton';

describe('MeditationCard', () => {
  it('mostra duração, título, descrição e chama onPress', async () => {
    const onPress = jest.fn();
    await render(
      <MeditationCard title="Calma" description="Respire fundo" time={5} onPress={onPress} />,
    );

    expect(screen.getByText('MEDITAÇÃO GUIADA · 5 MIN')).toBeTruthy();
    expect(screen.getByText('Calma')).toBeTruthy();
    expect(screen.getByText('Respire fundo')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Ouvir Meditação' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('omite a descrição vazia', async () => {
    await render(<MeditationCard title="Calma" description="" time={1} />);

    expect(screen.queryByText('Respire fundo')).toBeNull();
    expect(screen.getByText('Calma')).toBeTruthy();
  });
});

describe('MeditationHeader', () => {
  it('mostra kicker, título como cabeçalho e subtítulo', async () => {
    await render(<MeditationHeader title="Meditações" subtitle="Sub" kicker="KICK" />);

    expect(screen.getByRole('header', { name: 'Meditações' })).toBeTruthy();
    expect(screen.getByText('Sub')).toBeTruthy();
    expect(screen.getByText('KICK')).toBeTruthy();
  });

  it('omite kicker e subtítulo vazios', async () => {
    await render(<MeditationHeader title="Só título" subtitle="" />);

    expect(screen.getByText('Só título')).toBeTruthy();
    expect(screen.queryByText('KICK')).toBeNull();
  });
});

describe('MeditationSelection', () => {
  it('lista os passos numerados e aciona os dois botões', async () => {
    const onMain = jest.fn();
    const onSecondary = jest.fn();
    await render(
      <MeditationSelection
        title="Calma"
        description="Descrição"
        time={3}
        preparationTitle="ANTES"
        preparationSteps={['Passo A', 'Passo B']}
        buttonMain={{ text: 'Começar', onPress: onMain }}
        buttonSecondary={{ text: 'Agora não', onPress: onSecondary }}
      />,
    );

    expect(screen.getByText('MEDITAÇÃO GUIADA · 3 MIN')).toBeTruthy();
    expect(screen.getByText('ANTES')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('Passo A')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('Passo B')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Começar' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Agora não' }));
    expect(onMain).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });
});

describe('NoMeditationCard', () => {
  it('sugere uma respiração e navega para ela', async () => {
    await render(<NoMeditationCard />);

    expect(screen.getByText('Ainda não há meditações disponíveis')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Fazer uma respiração' }));
    expect(mockRouter.push).toHaveBeenCalledWith('/respiracao');
  });
});

describe('PlaybackErrorCard', () => {
  it('mostra o alerta e chama retry/encerrar', async () => {
    const onRetry = jest.fn();
    const onEnd = jest.fn();
    await render(<PlaybackErrorCard onRetry={onRetry} onEnd={onEnd} />);

    expect(screen.getByText('Não foi possível reproduzir o áudio.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Tentar novamente' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Encerrar' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});

describe('PlayerButton', () => {
  it('renderiza o ícone e chama onPress', async () => {
    const onPress = jest.fn();
    await render(<PlayerButton icon={<Text>ICON</Text>} onPress={onPress} />);

    await fireEvent.press(screen.getByText('ICON'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('não chama onPress quando desabilitado', async () => {
    const onPress = jest.fn();
    await render(<PlayerButton icon={<Text>ICON</Text>} onPress={onPress} disabled />);

    await fireEvent.press(screen.getByText('ICON'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
