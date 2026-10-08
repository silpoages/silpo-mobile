import { StyleSheet, View } from 'react-native';

import { CheckIcon } from '@/components/icons/checkIcon';
import { EmailIcon } from '@/components/icons/EmailIcon';
import { colors, radii } from '@/theme';

type StatusBadgeProps = {
  variant: 'pending' | 'confirmed';
};

export function StatusBadge({ variant }: StatusBadgeProps) {
  if (variant === 'confirmed') {
    return (
      <View style={[styles.badge, styles.confirmed]}>
        <CheckIcon />
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.pending]}>
      <EmailIcon />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  pending: {
    backgroundColor: colors.surfaceTint,
    borderRadius: radii.button + 6,
  },
  confirmed: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
  },
});
