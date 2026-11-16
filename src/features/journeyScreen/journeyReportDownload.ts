import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { buildJourneyReportHtml, type JourneyReportData } from './journeyReportTemplate';

/** Tamanho de página A4 em pontos (72 dpi), igual ao `@page` do template. */
const A4_WIDTH_PT = 595;
const A4_HEIGHT_PT = 842;

/**
 * Android/iOS: gera o PDF com o `expo-print` e abre a folha de compartilhar, onde a pessoa
 * salva o arquivo ("Salvar em Arquivos", Downloads, Drive...) ou envia direto.
 * A versão web fica em `journeyReportDownload.web.ts`.
 */
export async function downloadJourneyReport(
  data: JourneyReportData,
  fileName: string,
): Promise<void> {
  const html = buildJourneyReportHtml(data);
  const { uri } = await Print.printToFileAsync({
    html,
    width: A4_WIDTH_PT,
    height: A4_HEIGHT_PT,
  });

  // `printToFileAsync` nomeia o arquivo com um UUID interno; renomeia pra
  // algo que a pessoa reconheça na folha de compartilhar.
  const renamedUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.deleteAsync(renamedUri, { idempotent: true });
  await FileSystem.copyAsync({ from: uri, to: renamedUri });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(renamedUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Minha Jornada',
      UTI: 'com.adobe.pdf',
    });
    return;
  }

  await Print.printAsync({ html });
}
