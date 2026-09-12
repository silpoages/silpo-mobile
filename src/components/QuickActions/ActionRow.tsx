import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ActionButton } from './ActionButton';
import { colors, fontFamily, fontSize } from '@/theme';

const ICON_SIZE = 24;
const ICON_COLOR = colors.textSecondary;

const respire = <FontAwesome5 name="wind" size={ICON_SIZE} color={ICON_COLOR} />;
const medite = <MaterialCommunityIcons name="meditation" size={ICON_SIZE} color={ICON_COLOR} />;
const momento = <MaterialCommunityIcons name="chart-bubble" size={ICON_SIZE} color={ICON_COLOR} />;

const ACTIONS = [
  { id: 'respire', icon: respire, label: 'Respiração', time: '3-5 min' },
  { id: 'medite', icon: medite, label: 'Meditação', time: '4-10 min' },
  { id: 'momento', icon: momento, label: 'Um momento', time: 'interativo' },
];

interface ActionRowProps {
  onSelectAction?: (action: string) => void;
}

export function ActionRow({ onSelectAction }: ActionRowProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handlePress = (actionId: string) => {
    const next = selected === actionId ? null : actionId;
    setSelected(next);
    if (onSelectAction && next) {
      onSelectAction(next);
    }
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Exercícios Rápidos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        persistentScrollbar={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ACTIONS.map((item) => (
          <ActionButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            time={item.time}
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
