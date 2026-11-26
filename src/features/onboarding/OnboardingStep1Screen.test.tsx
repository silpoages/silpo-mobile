import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockRouter } from '@test/mocks/expoRouter';
import { withOnboarding } from '@test/onboardingTestUtils';

import { OnboardingStep1Screen } from '@/features/onboarding/OnboardingStep1Screen';

describe('OnboardingStep1Screen', () => {
  it('valida os três campos obrigatórios', async () => {
    await render(withOnboarding(<OnboardingStep1Screen />));

    expect(screen.getByText('Como você gostaria de ser chamado?')).toBeTruthy();
    expect(screen.getByText('2 de 4')).toBeTruthy();

    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(screen.getByText('O nome é obrigatório.')).toBeTruthy();
    expect(screen.getByText('A data de nascimento é obrigatória.')).toBeTruthy();
    expect(screen.getByText('O gênero é obrigatório.')).toBeTruthy();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('considera nome só com espaços como vazio', async () => {
    await render(withOnboarding(<OnboardingStep1Screen />));

    await fireEvent.changeText(screen.getByTestId('full-name-field'), '   ');
    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(screen.getByText('O nome é obrigatório.')).toBeTruthy();
  });

  it('limpa o erro de cada campo ao editar e avança quando tudo está preenchido', async () => {
    await render(withOnboarding(<OnboardingStep1Screen />));

    await fireEvent.press(screen.getByTestId('continue-button'));
    expect(screen.getAllByRole('alert')).toHaveLength(3);

    await fireEvent.changeText(screen.getByTestId('full-name-field'), 'Ana');
    expect(screen.queryByText('O nome é obrigatório.')).toBeNull();

    await fireEvent.changeText(screen.getByTestId('birth-date-field'), '10/10/1990');
    expect(screen.queryByText('A data de nascimento é obrigatória.')).toBeNull();

    await fireEvent.press(screen.getByTestId('gender-field'));
    await fireEvent.press(screen.getByRole('radio', { name: 'Mulher' }));
    expect(screen.queryByText('O gênero é obrigatório.')).toBeNull();

    await fireEvent.press(screen.getByTestId('continue-button'));

    expect(screen.queryByRole('alert')).toBeNull();
    expect(mockRouter.push).toHaveBeenCalledWith('/onboarding/etapa-2');
  });
});
