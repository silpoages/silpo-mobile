import html2pdf from 'html2pdf.js';
import { colors } from '@/theme';
import {
  buildJourneyReportFragment,
  REPORT_FONTS_URL,
  REPORT_ROOT_CLASS,
  type JourneyReportData,
} from './journeyReportTemplate';

/** Margem da página em mm, igual ao `@page` do PDF gerado no celular. */
const PAGE_MARGIN_MM = 16;
/** Largura útil de uma folha A4 (210 mm) descontadas as margens. */
const CONTENT_WIDTH_MM = 210 - PAGE_MARGIN_MM * 2;
const FONT_WEIGHTS = ['400', '600', '700', '800'];

/** Garante a Nunito carregada antes de rasterizar; sem rede, segue com a fonte reserva. */
async function ensureReportFonts(): Promise<void> {
  if (!document.querySelector(`link[href="${REPORT_FONTS_URL}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = REPORT_FONTS_URL;
    const loaded = new Promise<void>((resolve) => {
      link.onload = () => resolve();
      link.onerror = () => resolve();
    });
    document.head.appendChild(link);
    await loaded;
  }

  await Promise.all(
    FONT_WEIGHTS.map((weight) => document.fonts.load(`${weight} 16px Nunito`).catch(() => [])),
  );
}

/**
 * Web: o `expo-print` só abre `window.print()` (que imprime a tela do app, não o
 * relatório), então o PDF é montado no navegador com o html2pdf.js e baixado direto.
 */
export async function downloadJourneyReport(
  data: JourneyReportData,
  fileName: string,
): Promise<void> {
  await ensureReportFonts();

  const container = document.createElement('div');
  container.style.width = `${CONTENT_WIDTH_MM}mm`;
  container.innerHTML = buildJourneyReportFragment(data);

  // As margens da folha saem brancas no jsPDF; fundo branco evita um "quadro" verde.
  const root = container.querySelector<HTMLElement>(`.${REPORT_ROOT_CLASS}`);
  if (root) {
    root.style.background = colors.surface;
  }

  // `pagebreak` existe no html2pdf.js (plugin `pagebreaks`), mas falta no `type.d.ts` do pacote;
  // por isso as opções ficam numa variável em vez de um literal direto no `.set()`.
  const options = {
    margin: PAGE_MARGIN_MM,
    filename: fileName,
    image: { type: 'jpeg' as const, quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: colors.surface },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: {
      mode: ['css', 'legacy'],
      avoid: [
        '.metrics-row',
        '.card:not(.achievements-card)',
        '.achievements-header',
        '.achievement-item',
      ],
    },
  };

  await html2pdf().set(options).from(container).save();
}
