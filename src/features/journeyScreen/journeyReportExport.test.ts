import type { Achievement } from '@/features/achievements/achievementsService';
import type { JourneyData } from './journeyService';

const mockDownloadAsync = jest.fn();
const mockFromModule = jest.fn();
const mockReadAsStringAsync = jest.fn();
const mockDownloadJourneyReport = jest.fn();

jest.mock('expo-asset', () => ({
  Asset: { fromModule: (...args: unknown[]) => mockFromModule(...args) },
}));
jest.mock('expo-file-system/legacy', () => ({
  EncodingType: { Base64: 'base64' },
  readAsStringAsync: (...args: unknown[]) => mockReadAsStringAsync(...args),
}));
let mockPlatformOS = 'ios';
// Só `Platform.OS` muda; o resto do React Native continua o real.
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return Object.create(actual, {
    Platform: { get: () => ({ ...actual.Platform, OS: mockPlatformOS }) },
  });
});
jest.mock('./journeyReportDownload', () => ({
  downloadJourneyReport: (...args: unknown[]) => mockDownloadJourneyReport(...args),
}));

const journey: JourneyData = {
  daysRegistered: 3,
  practicesTried: 1,
  exercisesCompleted: 2,
  moodCounts: { BEM: 3 },
  achievements: { unlocked: 1, total: 4 },
};

const achievementList: Achievement[] = [
  {
    id: 'a1',
    name: 'Primeiro passo',
    description: 'd',
    icon: 'star',
    category: 'mood',
    unlocked: true,
    progress: { current: 1, target: 1 },
    unlockedAt: null,
  },
];

/** Carrega o módulo do zero (sem o logo em cache) simulando a plataforma informada. */
function loadModule(os: 'ios' | 'android' | 'web' = 'ios') {
  mockPlatformOS = os;
  let exportJourneyReport!: typeof import('./journeyReportExport').exportJourneyReport;
  jest.isolateModules(() => {
    ({ exportJourneyReport } = require('./journeyReportExport'));
  });
  return exportJourneyReport;
}

describe('exportJourneyReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
    // 05/02/2026 local; em UTC ainda é fevereiro.
    jest.setSystemTime(new Date(2026, 1, 5, 12, 0, 0));
    mockDownloadJourneyReport.mockResolvedValue(undefined);
    mockReadAsStringAsync.mockResolvedValue('QkFTRTY0');
    mockFromModule.mockReturnValue({
      uri: 'http://metro/logo.png',
      localUri: 'file:///local/logo.png',
      downloadAsync: mockDownloadAsync,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('no celular, embute o logo em base64 e gera o PDF do mês corrente', async () => {
    const exportJourneyReport = loadModule('ios');

    await exportJourneyReport(journey, achievementList, '  Ana Maria de Souza ');

    expect(mockDownloadAsync).toHaveBeenCalled();
    expect(mockReadAsStringAsync).toHaveBeenCalledWith('file:///local/logo.png', {
      encoding: 'base64',
    });
    expect(mockDownloadJourneyReport).toHaveBeenCalledWith(
      {
        ...journey,
        userName: '  Ana Maria de Souza ',
        period: { month: '2026-02', startDate: '2026-02-01', endDate: '2026-02-28' },
        logoDataUri: 'data:image/png;base64,QkFTRTY0',
        achievementList,
      },
      'jornada-Ana-Souza_05-02-2026.pdf',
    );
  });

  it('reaproveita o logo já lido nas próximas exportações', async () => {
    const exportJourneyReport = loadModule('android');

    await exportJourneyReport(journey, [], 'Ana');
    await exportJourneyReport(journey, [], 'Ana');

    expect(mockReadAsStringAsync).toHaveBeenCalledTimes(1);
    expect(mockDownloadJourneyReport.mock.calls[1][0].logoDataUri).toBe(
      'data:image/png;base64,QkFTRTY0',
    );
  });

  it('usa a uri do asset quando não há localUri', async () => {
    mockFromModule.mockReturnValue({
      uri: 'file:///bundle/logo.png',
      localUri: null,
      downloadAsync: mockDownloadAsync,
    });
    const exportJourneyReport = loadModule('ios');

    await exportJourneyReport(journey, [], 'Ana');

    expect(mockReadAsStringAsync).toHaveBeenCalledWith('file:///bundle/logo.png', {
      encoding: 'base64',
    });
  });

  it('na web, usa a URL do asset sem ler o arquivo', async () => {
    const exportJourneyReport = loadModule('web');

    await exportJourneyReport(journey, [], 'Ana');

    expect(mockReadAsStringAsync).not.toHaveBeenCalled();
    expect(mockDownloadJourneyReport.mock.calls[0][0].logoDataUri).toBe('http://metro/logo.png');
  });

  it('remove acentos e caracteres especiais do nome do arquivo', async () => {
    const exportJourneyReport = loadModule('ios');

    await exportJourneyReport(journey, [], 'José  da Conceição!');

    expect(mockDownloadJourneyReport.mock.calls[0][1]).toBe(
      'jornada-Jose-Conceicao_05-02-2026.pdf',
    );
  });

  it('usa um nome padrão quando o usuário não tem nome', async () => {
    const exportJourneyReport = loadModule('ios');

    await exportJourneyReport(journey, [], '   ');

    expect(mockDownloadJourneyReport.mock.calls[0][1]).toBe('jornada-usuario_05-02-2026.pdf');
  });

  it('calcula o último dia do mês (ano bissexto e meses de 31 dias)', async () => {
    const exportJourneyReport = loadModule('ios');

    jest.setSystemTime(new Date(Date.UTC(2028, 1, 10, 12)));
    await exportJourneyReport(journey, [], 'Ana');
    jest.setSystemTime(new Date(Date.UTC(2026, 11, 10, 12)));
    await exportJourneyReport(journey, [], 'Ana');

    expect(mockDownloadJourneyReport.mock.calls[0][0].period).toEqual({
      month: '2028-02',
      startDate: '2028-02-01',
      endDate: '2028-02-29',
    });
    expect(mockDownloadJourneyReport.mock.calls[1][0].period).toEqual({
      month: '2026-12',
      startDate: '2026-12-01',
      endDate: '2026-12-31',
    });
  });

  it('propaga falhas da geração do PDF', async () => {
    mockDownloadJourneyReport.mockRejectedValue(new Error('falhou'));
    const exportJourneyReport = loadModule('ios');

    await expect(exportJourneyReport(journey, [], 'Ana')).rejects.toThrow('falhou');
  });
});
