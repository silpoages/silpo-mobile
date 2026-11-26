import { fireEvent, render, screen } from '@testing-library/react-native';

import ButtonProfile from '@/components/profileScreen/ButtonProfile';
import SectionButtonProfile from '@/components/profileScreen/SectionButtonProfile';

describe('ButtonProfile', () => {
  it('mostra título, informação extra e chama onPress', async () => {
    const onPress = jest.fn();
    await render(
      <ButtonProfile icon="heart" info="Maria" onPress={onPress} title="Pessoa de conforto" />,
    );

    expect(screen.getByText('Pessoa de conforto')).toBeTruthy();
    expect(screen.getByText('Maria')).toBeTruthy();

    await fireEvent.press(screen.getByText('Pessoa de conforto'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('aplica a cor do título e omite ícone/chevron quando pedido', async () => {
    await render(
      <ButtonProfile
        icon={null}
        onPress={jest.fn()}
        showChevron={false}
        title="Excluir conta"
        titleColor="#f00"
      />,
    );

    expect(screen.getByText('Excluir conta')).toHaveStyle({ color: '#f00' });
  });

  it('usa cor de ícone customizada sem info', async () => {
    await render(
      <ButtonProfile icon="bell" iconColor="#123456" onPress={jest.fn()} title="Notificações" />,
    );
    expect(screen.getByText('Notificações')).toBeTruthy();
    expect(screen.queryByText('Maria')).toBeNull();
  });
});

describe('SectionButtonProfile', () => {
  it('mostra o título da seção e todos os itens', async () => {
    const onPress = jest.fn();
    await render(
      <SectionButtonProfile
        items={[
          { title: 'A', icon: 'bell', onPress },
          { title: 'B', icon: 'trash-2', onPress },
        ]}
        title="EXPERIÊNCIA"
      />,
    );

    expect(screen.getByText('EXPERIÊNCIA')).toBeTruthy();
    await fireEvent.press(screen.getByText('B'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('A')).toBeTruthy();
  });

  it('omite o título quando vazio', async () => {
    await render(
      <SectionButtonProfile
        items={[{ title: 'Sair', icon: 'log-out', onPress: jest.fn() }]}
        title=""
      />,
    );
    expect(screen.getByText('Sair')).toBeTruthy();
    expect(screen.queryByText('EXPERIÊNCIA')).toBeNull();
  });
});
