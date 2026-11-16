import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ActionButton } from './ActionButton';
import { colors, fontFamily, fontSize } from '@/theme';

const ICON_SIZE = 20;
const ICON_COLOR = colors.primary;

const respire = <FontAwesome5 name="wind" size={ICON_SIZE} color={ICON_COLOR} />;
const medite = <MaterialCommunityIcons name="meditation" size={ICON_SIZE} color={ICON_COLOR} />;
const momento = <MaterialCommunityIcons name="chart-bubble" size={ICON_SIZE} color={ICON_COLOR} />;

const ACTIONS = [
  { id: 'respire', icon: respire, label: 'Respiração', time: '3–5 min' },
  { id: 'medite', icon: medite, label: 'Meditação', time: '4–10 min' },
  { id: 'momento', icon: momento, label: 'Um momento', time: 'interativo' },
];

interface ActionRowProps {
  onSelectAction?: (action: string) => void;
}

export function ActionRow({ onSelectAction }: ActionRowProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EXERCÍCIOS RÁPIDOS</Text>
      <View style={styles.row}>
        {ACTIONS.map((item) => (
          <ActionButton
            key={item.id}
            icon={item.icon}
            label={item.label}
            time={item.time}
            onPress={() => onSelectAction?.(item.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
});
