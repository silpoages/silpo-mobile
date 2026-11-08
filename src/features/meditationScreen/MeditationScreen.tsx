import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BackButton } from '@/components/BackButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import MeditationCard from '@/components/meditationScreen/MeditationCard';
import { MeditationHeader } from '@/components/meditationScreen/MeditationHeader';
import { colors } from '@/theme';
import { AuthFormFooter } from '../auth/components';
import NoMeditationCard from '@/components/meditationScreen/NoMeditationCard';
import { useState } from 'react';
import { MeditationSelection } from '@/components/meditationScreen/MeditationSelection';

type CardProp = {
  title: string;
  description: string;
  time: number;
};

const MEDITATIONS: CardProp[] = [
  {
    title: 'Natureza em Você',
    description: 'Eu sou um cara legal',
    time: 10,
  },
  {
    title: 'Teste Numero 2',
    description: 'Eu sou um cara legal e nao gosto de ouvir palavras feias ',
    time: 5,
  },
];

export function MeditationScreen() {
  const router = useRouter();
  const [selectedMeditation, setSelectedMeditation] = useState<CardProp | null>(null);

  function handleBack() {
    if (selectedMeditation) {
      setSelectedMeditation(null);
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  }

  return (
    <ScreenContainer background={colors.surfaceTint} contentStyle={styles.screenContent}>
      {selectedMeditation ? (
        <MeditationSelection
          title={selectedMeditation.title}
          description={selectedMeditation.description}
          time={selectedMeditation.time}
          onPressBack={handleBack}
        />
      ) : (
        <>
          <BackButton onPress={handleBack} />
          <MeditationHeader title="Meditações" subtitle="Áudios guiados para voltar ao presente." />

          <View style={styles.cardList}>
            {MEDITATIONS.length > 0 ? (
              MEDITATIONS.map((card) => (
                <MeditationCard
                  key={card.title}
                  title={card.title}
                  description={card.description}
                  time={card.time}
                  onPress={() => setSelectedMeditation(card)}
                />
              ))
            ) : (
              <View style={{ alignItems: 'center', gap: 16 }}>
                <NoMeditationCard />
                <AuthFormFooter
                  actionLabel="Voltar para o início"
                  onPressAction={() => router.navigate('/')}
                />
              </View>
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {},
  cardList: {
    gap: 16,
    padding: 16,
  },
});
