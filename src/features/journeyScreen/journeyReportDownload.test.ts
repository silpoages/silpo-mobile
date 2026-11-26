import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { downloadJourneyReport } from './journeyReportDownload';
import { buildJourneyReportHtml, type JourneyReportData } from './journeyReportTemplate';

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
  printAsync: jest.fn(),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));
jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  deleteAsync: jest.fn(),
  copyAsync: jest.fn(),
}));

const printMock = jest.mocked(Print);
const sharingMock = jest.mocked(Sharing);
const fileSystemMock = jest.mocked(FileSystem);

const data: JourneyReportData = {
  daysRegistered: 2,
  practicesTried: 1,
  exercisesCompleted: 0,
  moodCounts: { BEM: 2 },
  achievements: { unlocked: 0, total: 2 },
  userName: 'Ana',
  period: { month: '2026-01', startDate: '2026-01-01', endDate: '2026-01-31' },
  logoDataUri: 'data:image/png;base64,AAA',
  achievementList: [],
};

describe('downloadJourneyReport (nativo)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    printMock.printToFileAsync.mockResolvedValue({
      uri: 'file:///tmp/uuid.pdf',
      numberOfPages: 1,
    });
  });

  it('gera o PDF em A4, renomeia e abre a folha de compartilhar', async () => {
    sharingMock.isAvailableAsync.mockResolvedValue(true);

    await downloadJourneyReport(data, 'jornada.pdf');

    expect(printMock.printToFileAsync).toHaveBeenCalledWith({
      html: buildJourneyReportHtml(data),
      width: 595,
      height: 842,
    });
    expect(fileSystemMock.deleteAsync).toHaveBeenCalledWith('file:///cache/jornada.pdf', {
      idempotent: true,
    });
    expect(fileSystemMock.copyAsync).toHaveBeenCalledWith({
      from: 'file:///tmp/uuid.pdf',
      to: 'file:///cache/jornada.pdf',
    });
    expect(sharingMock.shareAsync).toHaveBeenCalledWith('file:///cache/jornada.pdf', {
      mimeType: 'application/pdf',
      dialogTitle: 'Minha Jornada',
      UTI: 'com.adobe.pdf',
    });
    expect(printMock.printAsync).not.toHaveBeenCalled();
  });

  it('sem compartilhamento disponível, abre a impressão do sistema', async () => {
    sharingMock.isAvailableAsync.mockResolvedValue(false);

    await downloadJourneyReport(data, 'jornada.pdf');

    expect(sharingMock.shareAsync).not.toHaveBeenCalled();
    expect(printMock.printAsync).toHaveBeenCalledWith({ html: buildJourneyReportHtml(data) });
  });
});
