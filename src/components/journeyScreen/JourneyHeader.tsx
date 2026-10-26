import { StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { colors, fontFamily, fontSize } from '@/theme';

type JourneyHeaderProps = {
  userName: string;
  onPressAvatar: () => void;
};

export function JourneyHeader({ userName, onPressAvatar }: JourneyHeaderProps) {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Minha jornada
      </Text>
      <ProfileAvatar userName={userName} onPress={onPressAvatar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.extraBold,
    fontSize: fontSize.display,
    color: colors.text,
  },
});
