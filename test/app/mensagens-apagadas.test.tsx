import { render } from '@testing-library/react-native';

import DeletedEntriesRoute from '../../app/mensagens-apagadas';
import { DeletedEntriesScreen } from '@/features/deletedEntriesScreen/DeletedEntriesScreen';

jest.mock('@/features/deletedEntriesScreen/DeletedEntriesScreen', () => ({
  DeletedEntriesScreen: jest.fn(() => null),
}));

it('renderiza a tela de mensagens apagadas', async () => {
  await render(<DeletedEntriesRoute />);
  expect(DeletedEntriesScreen).toHaveBeenCalled();
});
