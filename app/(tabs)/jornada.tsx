import { JourneyScreen } from '@/features/journeyScreen/JourneyScreen';
import { useJourney } from '@/features/journeyScreen/useJourney';

export default function JourneyRoute() {
  const { journey, isLoading, hasError, retry } = useJourney();

  return (
    <JourneyScreen journey={journey} isLoading={isLoading} hasError={hasError} onRetry={retry} />
  );
}
