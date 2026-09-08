import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function useAppNavigation() {
  const navigation = useNavigation<NavigationProp>();

  const goToHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  return { goToHome };
}
