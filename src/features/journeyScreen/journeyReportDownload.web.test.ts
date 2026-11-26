/**
 * @jest-environment jsdom
 */
import html2pdf from 'html2pdf.js';
import { colors } from '@/theme';
import { downloadJourneyReport } from './journeyReportDownload.web';
import { REPORT_FONTS_URL, type JourneyReportData } from './journeyReportTemplate';

const mockSave = jest.fn();
const mockFrom = jest.fn();
const mockSet = jest.fn();

jest.mock('html2pdf.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const html2pdfMock = html2pdf as unknown as jest.Mock;

const data: JourneyReportData = {
  daysRegistered: 2,
  practicesTried: 1,
  exercisesCompleted: 0,
  moodCounts: { BEM: 2 },
  achievements: { unlocked: 0, total: 2 },
  userName: 'Ana',
  period: { month: '2026-01', startDate: '2026-01-01', endDate: '2026-01-31' },
  logoDataUri: 'logo.png',
  achievementList: [],
};

const fontsLoad = jest.fn();

/** O `<link>` não carrega no jsdom: dispara onload/onerror assim que ele entra no `<head>`. */
function autoResolveFontLink(event: 'onload' | 'onerror') {
  const originalAppend = document.head.appendChild.bind(document.head);
  return jest.spyOn(document.head, 'appendChild').mockImplementation((node) => {
    const result = originalAppend(node);
    const handler = (node as HTMLLinkElement)[event];
    handler?.call(node as HTMLLinkElement, new Event(event.slice(2)));
    return result;
  });
}

describe('downloadJourneyReport (web)', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    jest.clearAllMocks();
    mockSave.mockResolvedValue(undefined);
    mockFrom.mockReturnValue({ save: mockSave });
    mockSet.mockReturnValue({ from: mockFrom });
    html2pdfMock.mockReturnValue({ set: mockSet });
    fontsLoad.mockResolvedValue([]);
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load: fontsLoad },
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('carrega a fonte, monta o relatório e baixa o PDF com o html2pdf', async () => {
    autoResolveFontLink('onload');

    await downloadJourneyReport(data, 'jornada-ana.pdf');

    const link = document.head.querySelector<HTMLLinkElement>(`link[href="${REPORT_FONTS_URL}"]`);
    expect(link?.rel).toBe('stylesheet');
    expect(fontsLoad.mock.calls.map(([font]) => font)).toEqual([
      '400 16px Nunito',
      '600 16px Nunito',
      '700 16px Nunito',
      '800 16px Nunito',
    ]);

    const options = mockSet.mock.calls[0][0];
    expect(options).toMatchObject({
      margin: 16,
      filename: 'jornada-ana.pdf',
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      html2canvas: { backgroundColor: colors.surface },
    });
    expect(options.pagebreak.mode).toEqual(['css', 'legacy']);

    const container = mockFrom.mock.calls[0][0] as HTMLDivElement;
    expect(container.style.width).toBe('178mm');
    expect(container.textContent).toContain('Minha Jornada');
    const root = container.querySelector<HTMLElement>('.journey-report');
    expect(root?.style.background).not.toBe('');
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('segue mesmo se a fonte falhar ao carregar', async () => {
    autoResolveFontLink('onerror');
    fontsLoad.mockRejectedValue(new Error('offline'));

    await expect(downloadJourneyReport(data, 'a.pdf')).resolves.toBeUndefined();
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  it('não injeta o <link> da fonte de novo quando ele já existe', async () => {
    const existing = document.createElement('link');
    existing.href = REPORT_FONTS_URL;
    document.head.appendChild(existing);
    const appendSpy = jest.spyOn(document.head, 'appendChild');

    await downloadJourneyReport(data, 'a.pdf');

    expect(appendSpy).not.toHaveBeenCalled();
    expect(document.head.querySelectorAll('link')).toHaveLength(1);
  });

  it('não falha se o fragmento não tiver a raiz do relatório', async () => {
    autoResolveFontLink('onload');
    const querySelector = jest
      .spyOn(HTMLDivElement.prototype, 'querySelector')
      .mockReturnValue(null);

    await downloadJourneyReport(data, 'a.pdf');

    expect(querySelector).toHaveBeenCalledWith('.journey-report');
    expect(mockSave).toHaveBeenCalledTimes(1);
  });
});
