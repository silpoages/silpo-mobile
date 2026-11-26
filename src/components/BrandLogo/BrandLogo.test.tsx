import { render, screen } from '@testing-library/react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { layout } from '@/theme';

describe('BrandLogo', () => {
  it('usa o tamanho padrão do layout', async () => {
    await render(<BrandLogo />);

    expect(screen.getByLabelText('Silpo')).toHaveStyle({
      width: layout.logoSize,
      height: layout.logoSize,
    });
  });

  it('aceita um tamanho customizado', async () => {
    await render(<BrandLogo size={40} />);

    expect(screen.getByLabelText('Silpo')).toHaveStyle({ width: 40, height: 40 });
  });
});
