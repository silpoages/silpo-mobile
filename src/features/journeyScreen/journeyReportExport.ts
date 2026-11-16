import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import type { Achievement } from '@/features/achievements/achievementsService';
import { downloadJourneyReport } from './journeyReportDownload';
import type { JourneyReportPeriod } from './journeyReportTemplate';
import type { JourneyData } from './journeyService';

const logoModule = require('../../../assets/brand/silpo-logo.png');

let cachedLogoDataUri: string | null = null;

async function getLogoDataUri(): Promise<string> {
  // Na web o módulo já resolve pra uma URL servida pelo Metro (alcançável
  // pelo navegador); `expo-file-system` não tem implementação nessa
  // plataforma, então nem a chamamos aqui.
  if (Platform.OS === 'web') {
    return Asset.fromModule(logoModule).uri;
  }

  if (cachedLogoDataUri) {
    return cachedLogoDataUri;
  }

  const asset = Asset.fromModule(logoModule);
  await asset.downloadAsync();

  const base64 = await FileSystem.readAsStringAsync(asset.localUri ?? asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  cachedLogoDataUri = `data:image/png;base64,${base64}`;
  return cachedLogoDataUri;
}

function sanitizeForFileName(value: string): string {
  return value
    .normalize('NFD') // separa letra + acento (ex.: "é" -> "e" + ´)
    .replace(/[̀-ͯ]/g, '') // remove o acento isolado
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Primeiro nome + último sobrenome (não o nome completo, que pode ter vários
 * nomes do meio e deixar o arquivo com um nome enorme) + data de hoje.
 */
function buildFileName(userName: string): string {
  const parts = userName.trim().split(/\s+/).filter(Boolean);
  const shortName =
    parts.length > 1 ? `${parts[0]}-${parts[parts.length - 1]}` : (parts[0] ?? 'usuario');

  const today = new Date();
  const date = [
    String(today.getDate()).padStart(2, '0'),
    String(today.getMonth() + 1).padStart(2, '0'),
    today.getFullYear(),
  ].join('-');

  return `jornada-${sanitizeForFileName(shortName)}_${date}.pdf`;
}

/** Mês corrente em UTC, igual a `JourneyService.get_current_month`. */
function getCurrentPeriod(): JourneyReportPeriod {
  const now = new Date();
  const year = now.getUTCFullYear();
  const monthIndex = now.getUTCMonth();
  const month = String(monthIndex + 1).padStart(2, '0');
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

  return {
    month: `${year}-${month}`,
    startDate: `${year}-${month}-01`,
    endDate: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

/**
 * Gera o PDF da Minha Jornada a partir do resumo já carregado e da lista de
 * conquistas, e entrega o arquivo: download direto na web, folha de
 * compartilhar (salvar/enviar) no celular.
 */
export async function exportJourneyReport(
  journey: JourneyData,
  achievementList: Achievement[],
  userName: string,
): Promise<void> {
  const logoDataUri = await getLogoDataUri();

  await downloadJourneyReport(
    {
      ...journey,
      userName,
      period: getCurrentPeriod(),
      logoDataUri,
      achievementList,
    },
    buildFileName(userName),
  );
}
