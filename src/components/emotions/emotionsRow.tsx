import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { EmotionButton } from './emotions';
import { Ionicons } from '@expo/vector-icons';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const feliz = <Ionicons name="happy-outline" size={24} color="black" />;
const bem = <Entypo name="emoji-happy" size={24} color="black" />;
const cansado = <Entypo name="emoji-sad" size={24} color="black" />;
const triste = <MaterialCommunityIcons name="emoticon-cry-outline" size={24} color="black" />;
const ansioso = <MaterialCommunityIcons name="emoticon-frown-outline" size={24} color="black" />;
const irritado = <MaterialCommunityIcons name="emoticon-angry-outline" size={24} color="black" />;

const EMOTIONS = [
  { id: 'feliz', emoji: feliz, label: 'Feliz' },
  { id: 'Bem', emoji: bem, label: 'Bem' },
  { id: 'Cansado', emoji: cansado, label: 'Cansado' },
  { id: 'triste', emoji: triste, label: 'Triste' },
  { id: 'ansioso', emoji: ansioso, label: 'Ansioso' },
  { id: 'irritado', emoji: irritado, label: 'Irritado' },
];

interface EmotionsRowProps {
  onSelectEmotion?: (emotion: string) => void;
}

export function EmotionsRow({ onSelectEmotion }: EmotionsRowProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handlePress = (emotionId: string) => {
    const next = selected === emotionId ? null : emotionId;
    setSelected(next);
    if (onSelectEmotion && next) {
      onSelectEmotion(next);
    }
  };

  return (
    <View style={styles.box}>
      <Text>Como você está se sentindo hoje?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        persistentScrollbar={false}
        contentContainerStyle={styles.scrollContent}
      >
        {EMOTIONS.map((item) => (
          <EmotionButton
            key={item.id}
            emoji={item.emoji}
            label={item.label}
            isSelected={selected === item.id}
            onPress={() => handlePress(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: '90%',
    marginVertical: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d5dcd7',
    borderRadius: 16,
    backgroundColor: '#f8faf8',
    overflow: 'hidden',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
});
