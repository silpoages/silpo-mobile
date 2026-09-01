import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Animated, GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';

export type TabKey = 'home' | 'diario' | 'jornada' | 'apoio';

type TabDefinition = {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
};

const TABS: TabDefinition[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
  { key: 'diario', label: 'Diário', icon: 'calendar-outline', activeIcon: 'calendar' },
  { key: 'jornada', label: 'Jornada', icon: 'leaf-outline', activeIcon: 'leaf' },
  { key: 'apoio', label: 'Apoio', icon: 'heart-outline', activeIcon: 'heart' },
];

type TabBarProps = {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
};

export function TabBar({ activeTab, onTabPress }: TabBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={tab.key === activeTab}
            onPress={() => onTabPress(tab.key)}
          />
        ))}
      </View>
    </View>
  );
}

type TabButtonProps = {
  tab: TabDefinition;
  isActive: boolean;
  onPress: () => void;
};

const RIPPLE_SIZE = 120;

function TabButton({ tab, isActive, onPress }: TabButtonProps) {
  const [rippleOrigin, setRippleOrigin] = useState({ x: 0, y: 0 });
  const [rippleAnim] = useState(() => new Animated.Value(0));

  const startRipple = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    setRippleOrigin({ x: locationX, y: locationY });
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const rippleScale = rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.3, 0.25, 0],
  });

  return (
    <View style={styles.tab}>
      <Pressable
        onPress={onPress}
        onPressIn={startRipple}
        hitSlop={{ top: 8, bottom: 8, left: 24, right: 24 }}
        style={[styles.highlight, isActive && styles.highlightActive]}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={tab.label}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ripple,
            {
              left: rippleOrigin.x - RIPPLE_SIZE / 2,
              top: rippleOrigin.y - RIPPLE_SIZE / 2,
              opacity: rippleOpacity,
              transform: [{ scale: rippleScale }],
            },
          ]}
        />
        <Ionicons
          name={isActive ? tab.activeIcon : tab.icon}
          size={22}
          color={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
        />
        <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
      </Pressable>
    </View>
  );
}

const ACTIVE_COLOR = '#2F6B4F';
const INACTIVE_COLOR = '#8A8A8E';

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F1ED',
    borderRadius: 32,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  highlightActive: {
    backgroundColor: '#DCE6DE',
    paddingHorizontal: 18,
  },
  ripple: {
    position: 'absolute',
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    borderRadius: RIPPLE_SIZE / 2,
    backgroundColor: ACTIVE_COLOR,
  },
  label: {
    fontSize: 11,
    color: INACTIVE_COLOR,
  },
  labelActive: {
    color: ACTIVE_COLOR,
    fontWeight: '600',
  },
});
