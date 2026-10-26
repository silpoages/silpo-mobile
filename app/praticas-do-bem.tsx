import { useLocalSearchParams } from 'expo-router';

import { GoodPracticesScreen } from '@/features/goodPracticesScreen/GoodPracticesScreen';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export default function GoodPracticesRoute() {
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    description?: string;
    source?: string;
  }>();
  const id = firstParam(params.id);
  const title = firstParam(params.title);
  const description = firstParam(params.description);
  const isDailyPractice = firstParam(params.source) === 'daily';

  if (!id || !title) {
    return (
      <GoodPracticesScreen
        id=""
        title="Prática indisponível"
        description="Volte e escolha uma prática da lista."
      />
    );
  }

  return (
    <GoodPracticesScreen
      id={id}
      title={title}
      description={description}
      isDailyPractice={isDailyPractice}
    />
  );
}
