import { render } from '@testing-library/react-native';

import { CheckIcon } from '@/components/icons/CheckIcon';
import { ChevronLeftIcon } from '@/components/icons/ChevronLeftIcon';
import { DecorativeCircle } from '@/components/icons/DecorativeCircle';
import { EmailIcon } from '@/components/icons/EmailIcon';
import { EyeIcon } from '@/components/icons/EyeIcon';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { InfoIcon } from '@/components/icons/InfoIcon';

describe('ícones SVG', () => {
  it.each([
    ['CheckIcon', <CheckIcon key="a" />, <CheckIcon key="b" width={10} height={8} color="red" />],
    [
      'ChevronLeftIcon',
      <ChevronLeftIcon key="a" />,
      <ChevronLeftIcon key="b" size={10} color="red" />,
    ],
    ['DecorativeCircle', <DecorativeCircle key="a" />, <DecorativeCircle key="b" size={10} />],
    ['EmailIcon', <EmailIcon key="a" />, <EmailIcon key="b" size={10} color="red" />],
    ['HeartIcon', <HeartIcon key="a" />, <HeartIcon key="b" size={10} color="red" />],
    ['InfoIcon', <InfoIcon key="a" />, <InfoIcon key="b" size={10} color="red" />],
  ])('%s renderiza com props padrão e customizadas', async (_name, defaults, custom) => {
    const first = await render(defaults);
    expect(first.toJSON()).toBeTruthy();
    const second = await render(custom);
    expect(second.toJSON()).toBeTruthy();
  });

  it('EyeIcon desenha o traço só quando crossed', async () => {
    const open = await render(<EyeIcon />);
    const openJson = JSON.stringify(open.toJSON());
    const crossed = await render(<EyeIcon crossed size={10} color="red" />);
    const crossedJson = JSON.stringify(crossed.toJSON());

    expect(openJson).not.toContain('M4 20 20 4');
    expect(crossedJson).toContain('M4 20 20 4');
  });
});
