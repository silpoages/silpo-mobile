import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '@/components/Button';
import { exportJourneyReport } from '@/features/journeyScreen/journeyReportExport';
import type { JourneyData } from '@/features/journeyScreen/journeyService';
import { colors, fontFamily, fontSize, spacing } from '@/theme';

type ExportJourneyButtonProps = {
  journey: JourneyData;
  userName: string;
};

const EXPORT_ERROR_MESSAGE = 'Não foi possível gerar o PDF. Tente de novo.';

export function ExportJourneyButton({ journey, userName }: ExportJourneyButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  async function handleExport() {
    if (isExporting) {
      return;
    }

    setExportError(null);
    setIsExporting(true);

    try {
      await exportJourneyReport(journey, userName);
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
