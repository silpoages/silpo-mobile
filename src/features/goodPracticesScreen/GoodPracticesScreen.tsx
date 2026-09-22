import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const guidanceSteps = [
  'Respire fundo uma vez antes de começar.',
  'Vá no seu tempo - não existe pressa nem jeito certo',
  'Se preferir voltar, tudo bem. Tenha calma',
];

export function GoodPracticesScreen() {
  const [isStarted, setIsStarted] = useState(false);
  const router = useRouter();

  function handleNotNow() {
    router.back();
  }

  function handleStartPractice() {
    setIsStarted(true);
  }

  function handleFinishPractice() {
    if (router.canGoBack()) {
      router.back();
    }
  }

  function handleLeaveForLater() {
    if (router.canGoBack()) {
      router.back();
    }
  }

  return (
    <view>
      <Text>Prática do bem</Text>
      <Text>Sentar em um parque</Text>
      <Text>Escolha um banco tranquilo e fique o tempo que for confortável. Isso já conta.</Text>
      <Text>Se quiser, um caminho</Text>
      {guidanceSteps.map((step, index) => (
        <Text key={index}>
          {index + 1}. {step}
        </Text>
      ))}
      isStarted ? (
      <Pressable onPress={handleLeaveForLater}>
        <Text>Deixar para depois</Text>
      </Pressable>
      <Pressable onPress={handleFinishPractice}>
        <Text>Concluir prática</Text>
      </Pressable>
      )
    </view>
  );
}
