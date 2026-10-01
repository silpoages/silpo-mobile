import { GoodPracticesScreen } from '@/features/goodPracticesScreen/GoodPracticesScreen';

/** Placeholder até a tela receber a prática escolhida. */
const PLACEHOLDER_PRACTICE = {
  title: 'Sentar em um parque',
  description: 'Escolha um banco tranquilo e fique o tempo que for confortável. Só isso já conta',
};

export default function GoodPracticesRoute() {
  return (
    <GoodPracticesScreen
      title={PLACEHOLDER_PRACTICE.title}
      description={PLACEHOLDER_PRACTICE.description}
    />
  );
}
