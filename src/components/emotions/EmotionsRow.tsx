import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { EmotionButton } from './EmotionButton';
import { colors, fontFamily, fontSize } from '@/theme';

const ICON_SIZE = 24;
const ICON_COLOR = colors.textSecondary;

const happyIcon = (
  <MaterialCommunityIcons name="emoticon-excited-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const wellIcon = (
  <MaterialCommunityIcons name="emoticon-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const tiredIcon = (
  <MaterialCommunityIcons name="emoticon-neutral-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const sadIcon = (
  <MaterialCommunityIcons name="emoticon-sad-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const anxiousIcon = (
  <MaterialCommunityIcons name="emoticon-frown-outline" size={ICON_SIZE} color={ICON_COLOR} />
);
const angryIcon = (
  <MaterialCommunityIcons name="emoticon-angry-outline" size={ICON_SIZE} color={ICON_COLOR} />
);

const EMOTIONS = [
  { id: 'FELIZ', emoji: happyIcon, label: 'Feliz' },
  { id: 'BEM', emoji: wellIcon, label: 'Bem' },
  { id: 'CANSADO', emoji: tiredIcon, label: 'Cansado' },
  { id: 'TRISTE', emoji: sadIcon, label: 'Triste' },
  { id: 'ANSIOSO', emoji: anxiousIcon, label: 'Ansioso' },
  { id: 'IRRITADO', emoji: angryIcon, label: 'Irritado' },
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
      <Text style={styles.title}>Como você está se sentindo hoje?</Text>
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
    width: '100%',
    padding: 18,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.body,
    color: colors.text,
    marginBottom: 10,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
