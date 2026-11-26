import { render } from '@testing-library/react-native';

import { StatusBadge } from '@/components/emailConfirmationScreen/StatusBadge';
import { colors } from '@/theme';

describe('StatusBadge', () => {
  it.each([
    ['pending', colors.surfaceTint],
    ['confirmed', colors.primary],
  ] as const)('usa o fundo certo no estado %s', async (variant, backgroundColor) => {
    const { root } = await render(<StatusBadge variant={variant} />);

    expect(root).toHaveStyle({ backgroundColor });
  });
});
