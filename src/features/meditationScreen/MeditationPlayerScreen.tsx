import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors } from '@/theme/colors';
import { BackButton } from '@/components/BackButton';
import { useRouter } from 'expo-router';

export function MeditationPlayerScreen() {
  const router = useRouter();

  function handleClose() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.navigate('/');
    }
  }

  return (
    <ScreenContainer background={colors.surfaceTint} contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <BackButton onPress={handleClose} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {},
  header: {},
});
