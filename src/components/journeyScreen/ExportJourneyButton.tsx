import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '@/components/Button';
import { getAchievements } from '@/features/achievements/achievementsService';
import { useSession } from '@/features/auth/session/SessionContext';
import { exportJourneyReport } from '@/features/journeyScreen/journeyReportExport';
import type { JourneyData } from '@/features/journeyScreen/journeyService';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type ExportJourneyButtonProps = {
  journey: JourneyData;
  userName: string;
};

const EXPORT_ERROR_MESSAGE = 'Não foi possível gerar o PDF. Tente de novo.';

export function ExportJourneyButton({ journey, userName }: ExportJourneyButtonProps) {
  const session = useSession();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    if (isExporting) {
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      if (!session.token) {
        throw new Error('Sessão expirada.');
      }
      // Busca na hora para o PDF sair com o progresso atual das conquistas.
      const achievementList = await getAchievements(session.token);
      await exportJourneyReport(journey, achievementList, userName);
    } catch {
      setExportError(EXPORT_ERROR_MESSAGE);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Button variant="secondary" size="lg" loading={isExporting} onPress={handleExport}>
        Exportar Minha Jornada (PDF)
      </Button>
      {exportError ? <Text style={styles.error}>{exportError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.danger,
    textAlign: 'center',
  },
});
