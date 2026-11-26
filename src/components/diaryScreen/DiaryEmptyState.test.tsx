import { fireEvent, render, screen } from '@testing-library/react-native';

import { DiaryEmptyState } from '@/components/diaryScreen/DiaryEmptyState';

describe('DiaryEmptyState', () => {
  it('mostra o convite e chama onCreateEntry', async () => {
    const onCreateEntry = jest.fn();
    await render(<DiaryEmptyState onCreateEntry={onCreateEntry} />);

    expect(screen.getByRole('header', { name: 'Nenhum registro por aqui ainda.' })).toBeTruthy();
    await fireEvent.press(screen.getByText('Criar meu primeiro registro →'));
    expect(onCreateEntry).toHaveBeenCalledTimes(1);
  });
});
