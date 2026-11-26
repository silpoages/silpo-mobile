import { render, screen } from '@testing-library/react-native';

import { CompletedBadge } from '@/components/goodPracticesScreen/CompletedBadge';
import { StartedBadge } from '@/components/goodPracticesScreen/StartedBadge';
import { StepItem } from '@/components/goodPracticesScreen/StepItem';

describe('badges e passos da prática do bem', () => {
  it('CompletedBadge', async () => {
    await render(<CompletedBadge style={{ marginTop: 4 }} />);

    expect(screen.getByText('Prática concluída hoje')).toBeOnTheScreen();
  });

  it('StartedBadge', async () => {
    await render(<StartedBadge />);

    expect(screen.getByText('Prática iniciada')).toBeOnTheScreen();
  });

  it('StepItem mostra número e texto', async () => {
    await render(<StepItem number={2} text="Respire" />);

    expect(screen.getByText('2')).toBeOnTheScreen();
    expect(screen.getByText('Respire')).toBeOnTheScreen();
  });
});
