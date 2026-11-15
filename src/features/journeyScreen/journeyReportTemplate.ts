import { EMOTIONS } from '@/components/emotions/emotionConfig';
import type { MoodId } from '@/components/emotions/moodLogService';
import type { Achievement } from '@/features/achievements/achievementsService';
import { formatUnlockedDate } from '@/features/achievements/formatUnlockedDate';
import { colors, fontSize, radii, spacing } from '@/theme';
import type { JourneyData } from './journeyService';
import { pluralize } from './pluralize';

/**
 * Período do relatório, no mesmo formato de `period` em `GET /journey`
 * (`app/schemas/journey.py` no backend): `month` em `AAAA-MM`, datas em ISO.
 */
export type JourneyReportPeriod = {
  month: string;
  startDate: string;
  endDate: string;
};

export type JourneyReportData = JourneyData & {
  userName: string;
  period: JourneyReportPeriod;
  /**
   * Logo do Silpo como data URI (`data:image/png;base64,...`). A leitura do
   * PNG em `assets/brand/silpo-logo.png` é responsabilidade de quem gera o
   * PDF — este template só monta HTML a partir dos dados recebidos.
   */
  logoDataUri: string;
  /** Lista completa de conquistas (`GET /achievements`), exibida abaixo do resumo. */
  achievementList: Achievement[];
};

/** Fonte do relatório; quem renderiza o HTML (WebView do expo-print ou navegador) baixa daqui. */
export const REPORT_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap';

/** Classe raiz do relatório: todo o CSS fica restrito a ela, para poder ser injetado na página web. */
export const REPORT_ROOT_CLASS = 'journey-report';

const MONTH_LABELS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPeriodLabel(period: JourneyReportPeriod): string {
  const [year, month] = period.month.split('-');
  const monthLabel = MONTH_LABELS[Number(month) - 1];
  if (!monthLabel || !year) {
    return period.month;
  }
  return `${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)} de ${year}`;
}

/** Mesmo critério de `JourneyScreen`: tudo zerado é "sem registros" no período. */
function isJourneyReportEmpty(data: JourneyReportData): boolean {
  return (
    data.daysRegistered === 0 &&
    data.practicesTried === 0 &&
    data.exercisesCompleted === 0 &&
    data.achievements.unlocked === 0
  );
}

function buildMetricsSection(data: JourneyReportData): string {
  const metrics = [
    {
      value: data.daysRegistered,
      label: pluralize(
        data.daysRegistered,
        'dia com emoção registrada',
        'dias com emoção registrada',
      ),
    },
    {
      value: data.practicesTried,
      label: pluralize(
        data.practicesTried,
        'prática diferente realizada',
        'práticas diferentes realizadas',
      ),
    },
    {
      value: data.exercisesCompleted,
      label: pluralize(data.exercisesCompleted, 'exercício concluído', 'exercícios concluídos'),
    },
  ];

  return `
    <div class="metrics-row">
      ${metrics
        .map(
          (metric) => `
        <div class="card metric-card">
          <span class="metric-value">${metric.value}</span>
          <span class="metric-label">${escapeHtml(metric.label)}</span>
        </div>`,
        )
        .join('')}
    </div>`;
}

/** Mesma lógica de ordenação/barra de `MoodDistributionCard` + `MoodDistributionRow`. */
function buildMoodSection(moodCounts: Partial<Record<MoodId, number>>): string {
  const rows = EMOTIONS.map((emotion) => ({ ...emotion, count: moodCounts[emotion.id] ?? 0 }))
    .filter((emotion) => emotion.count > 0)
    .sort((a, b) => b.count - a.count);

  const body =
    rows.length === 0
      ? `<p class="footnote">Nenhuma emoção registrada neste período.</p>`
      : `<div class="mood-rows">
          ${rows
            .map((emotion) => {
              const fillPercent = Math.round((emotion.count / rows[0].count) * 100);
              return `
              <div class="mood-row">
                <span class="mood-label">${escapeHtml(emotion.journeyLabel)}</span>
                <span class="mood-track"><span class="mood-fill" style="width:${fillPercent}%"></span></span>
                <span class="mood-count">${emotion.count}</span>
              </div>`;
            })
            .join('')}
        </div>`;

  return `
    <div class="card">
      <h2 class="section-title">Como você tem se sentido</h2>
      ${body}
    </div>`;
}

/** Mesmos textos de `AchievementCard`: data do desbloqueio ou progresso atual/meta. */
function buildAchievementItem(achievement: Achievement): string {
  const { unlocked, unlockedAt, progress } = achievement;
  const name = escapeHtml(achievement.name);
  const description = escapeHtml(achievement.description);

  if (unlocked) {
    const status = unlockedAt
      ? `Desbloqueada em ${formatUnlockedDate(unlockedAt)}`
      : 'Desbloqueada';
    return `
      <div class="achievement-item">
        <span class="achievement-icon">★</span>
        <div class="achievement-text">
          <p class="achievement-name">${name}</p>
          <p class="achievement-description">${description}</p>
          <p class="achievement-status">${escapeHtml(status)}</p>
        </div>
      </div>`;
  }

  const fillPercent =
    progress.target > 0 ? Math.round(Math.min(progress.current / progress.target, 1) * 100) : 0;
  return `
      <div class="achievement-item achievement-item-locked">
        <span class="achievement-icon">☆</span>
        <div class="achievement-text">
          <p class="achievement-name">${name}</p>
          <p class="achievement-description">${description}</p>
          <div class="achievement-progress">
            <span class="achievement-track"><span class="achievement-fill" style="width:${fillPercent}%"></span></span>
            <span class="achievement-progress-label">${progress.current} de ${progress.target}</span>
          </div>
        </div>
      </div>`;
}

function buildAchievementsSection(data: JourneyReportData): string {
  const progress = `${data.achievements.unlocked} de ${data.achievements.total} ${pluralize(data.achievements.total, 'descoberta', 'descobertas')}`;
  // Mesma ordem da tela de conquistas: desbloqueadas primeiro, depois as bloqueadas.
  const items = [
    ...data.achievementList.filter((achievement) => achievement.unlocked),
    ...data.achievementList.filter((achievement) => !achievement.unlocked),
  ];

  return `
    <div class="card achievements-card">
      <div class="achievements-header">
        <span class="achievements-badge">★</span>
        <div>
          <h2 class="section-title">Minhas conquistas</h2>
          <p class="achievements-progress">${escapeHtml(progress)}</p>
        </div>
      </div>
      ${items.length > 0 ? `<div class="achievement-list">${items.map(buildAchievementItem).join('')}</div>` : ''}
    </div>`;
}

function buildEmptyState(periodLabel: string): string {
  return `
    <div class="card empty-card">
      <p class="empty-title">Sua jornada começa aqui</p>
      <p class="empty-subtitle">
        Nenhum registro em ${escapeHtml(periodLabel)} ainda. Cada emoção registrada vira parte
        da sua história, no seu ritmo.
      </p>
    </div>`;
}

/** Só para o documento completo (PDF nativo): tamanho de página e fundo da folha. */
const PRINT_DOCUMENT_CSS = `
  @page {
    size: A4;
    margin: 16mm;
  }

  html,
  body {
    margin: 0;
    background: ${colors.background};
  }
`;

/** Tudo restrito a `.journey-report`, para não vazar estilo quando injetado na página web. */
const REPORT_CSS = `
  .journey-report,
  .journey-report * {
    box-sizing: border-box;
  }

  .journey-report {
    background: ${colors.background};
    color: ${colors.text};
    font-family: 'Nunito', -apple-system, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .journey-report .header {
    display: flex;
    align-items: center;
    gap: ${spacing.lg}px;
    margin-bottom: ${spacing.lg}px;
    break-after: avoid;
  }

  .journey-report .logo {
    width: 56px;
    height: 56px;
    object-fit: contain;
    /* O PNG tem margem transparente embaixo (mesma razão do BrandLogo.tsx). */
    margin-bottom: -8px;
  }

  .journey-report .header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .journey-report .title {
    margin: 0;
    font-weight: 800;
    font-size: ${fontSize.display}px;
  }

  .journey-report .subtitle {
    margin: 0;
    font-weight: 700;
    font-size: ${fontSize.lg}px;
    color: ${colors.primary};
    overflow-wrap: anywhere;
  }

  .journey-report .period {
    margin: 0;
    font-weight: 400;
    font-size: ${fontSize.body}px;
    color: ${colors.textSecondary};
  }

  .journey-report .content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .journey-report .card {
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: 16px;
    padding: 14px;
    break-inside: avoid;
  }

  .journey-report .metrics-row {
    display: flex;
    gap: ${spacing.lg}px;
    break-inside: avoid;
  }

  .journey-report .metric-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${spacing.xs}px;
  }

  .journey-report .metric-value {
    font-weight: 800;
    font-size: ${fontSize.display}px;
    color: ${colors.primary};
  }

  .journey-report .metric-label {
    font-weight: 400;
    font-size: ${fontSize.md}px;
    color: ${colors.textSecondary};
    line-height: 18px;
  }

  .journey-report .section-title {
    margin: 0 0 ${spacing.md}px;
    font-weight: 700;
    font-size: ${fontSize.lg}px;
  }

  .journey-report .mood-rows {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .journey-report .mood-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .journey-report .mood-label {
    width: 76px;
    flex-shrink: 0;
    font-size: ${fontSize.md}px;
  }

  .journey-report .mood-track {
    flex: 1;
    display: block;
    height: 8px;
    border-radius: ${radii.pill}px;
    background: ${colors.surfaceMuted};
    overflow: hidden;
  }

  .journey-report .mood-fill {
    display: block;
    height: 100%;
    border-radius: ${radii.pill}px;
    background: ${colors.chartFill};
  }

  .journey-report .mood-count {
    min-width: 16px;
    text-align: right;
    font-weight: 600;
    font-size: ${fontSize.sm}px;
    color: ${colors.textSecondary};
    font-variant-numeric: tabular-nums;
  }

  .journey-report .footnote {
    margin: 0;
    font-size: ${fontSize.sm}px;
    color: ${colors.textSecondary};
  }

  .journey-report .achievements-card {
    /* A lista pode passar de uma página; cada item é que não quebra no meio. */
    break-inside: auto;
  }

  .journey-report .achievements-header {
    display: flex;
    align-items: center;
    gap: ${spacing.lg}px;
    break-inside: avoid;
  }

  .journey-report .achievements-header .section-title {
    margin: 0;
  }

  .journey-report .achievements-badge {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: ${colors.achievement.surface};
    color: ${colors.achievement.icon};
    font-size: 18px;
  }

  .journey-report .achievements-progress {
    margin: 4px 0 0;
    font-size: ${fontSize.md}px;
    color: ${colors.textSecondary};
  }

  .journey-report .achievement-list {
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing.sm}px;
    margin-top: 10px;
  }

  .journey-report .achievement-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    width: calc(50% - 3px);
    padding: 8px 10px;
    border: 1px solid ${colors.borderSubtle};
    border-radius: 12px;
    break-inside: avoid;
  }

  .journey-report .achievement-item-locked {
    background: ${colors.background};
  }

  .journey-report .achievement-icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: ${colors.achievement.surface};
    color: ${colors.achievement.icon};
    font-size: 15px;
  }

  .journey-report .achievement-item-locked .achievement-icon {
    background: ${colors.surfaceMuted};
    color: ${colors.textMuted};
  }

  .journey-report .achievement-text {
    flex: 1;
    min-width: 0;
  }

  .journey-report .achievement-name {
    margin: 0;
    font-weight: 700;
    font-size: ${fontSize.md}px;
  }

  .journey-report .achievement-item-locked .achievement-name {
    color: ${colors.textSecondary};
  }

  .journey-report .achievement-description {
    margin: 2px 0 0;
    font-size: ${fontSize.sm}px;
    line-height: 16px;
    color: ${colors.textSecondary};
  }

  .journey-report .achievement-status {
    margin: 3px 0 0;
    font-weight: 600;
    font-size: ${fontSize.sm}px;
    color: ${colors.achievement.icon};
  }

  .journey-report .achievement-progress {
    display: flex;
    align-items: center;
    gap: ${spacing.sm}px;
    margin-top: 4px;
  }

  .journey-report .achievement-track {
    flex: 1;
    display: block;
    height: 6px;
    border-radius: ${radii.pill}px;
    background: ${colors.surfaceMuted};
    overflow: hidden;
  }

  .journey-report .achievement-fill {
    display: block;
    height: 100%;
    border-radius: ${radii.pill}px;
    background: ${colors.chartFill};
  }

  .journey-report .achievement-progress-label {
    flex-shrink: 0;
    font-weight: 600;
    font-size: ${fontSize.sm}px;
    color: ${colors.textSecondary};
    font-variant-numeric: tabular-nums;
  }

  .journey-report .empty-card {
    text-align: center;
    padding: 32px 18px;
  }

  .journey-report .empty-title {
    margin: 0 0 ${spacing.md}px;
    font-weight: 600;
    font-size: ${fontSize.md}px;
  }

  .journey-report .empty-subtitle {
    margin: 0;
    font-weight: 400;
    font-size: ${fontSize.body}px;
    color: ${colors.textSecondary};
    line-height: 20px;
  }

  .journey-report .footer {
    margin-top: 10px;
    text-align: center;
    font-size: ${fontSize.xs}px;
    color: ${colors.textMuted};
  }

  /* Na impressão nativa o rodapé se repete em toda página; no PDF gerado na web fica ao final. */
  @media print {
    .journey-report .page {
      padding-bottom: 20mm;
    }

    .journey-report .footer {
      position: fixed;
      bottom: 8mm;
      left: 0;
      right: 0;
      margin-top: 0;
    }
  }
`;

/**
 * Conteúdo do relatório dentro de `.journey-report`, com o próprio `<style>`. Serve para
 * injetar na página web (geração do PDF no navegador) sem depender de `<head>`/`<body>`.
 */
export function buildJourneyReportFragment(data: JourneyReportData): string {
  const periodLabel = formatPeriodLabel(data.period);
  const userName = escapeHtml(data.userName.trim());

  const bodyContent = isJourneyReportEmpty(data)
    ? `${buildEmptyState(periodLabel)}${buildAchievementsSection(data)}`
    : `${buildMetricsSection(data)}${buildMoodSection(data.moodCounts)}${buildAchievementsSection(data)}`;

  return `<div class="${REPORT_ROOT_CLASS}">
  <style>${REPORT_CSS}</style>
  <main class="page">
    <header class="header">
      <img class="logo" src="${data.logoDataUri}" alt="Silpo" />
      <div class="header-text">
        <h1 class="title">Minha Jornada</h1>
        <p class="subtitle">${userName}</p>
        <p class="period">${escapeHtml(periodLabel)}</p>
      </div>
    </header>
    <section class="content">
      ${bodyContent}
    </section>
    <footer class="footer">Silpo • Minha Jornada • ${escapeHtml(periodLabel)}</footer>
  </main>
</div>`;
}

/**
 * Documento HTML completo do relatório "Minha Jornada" em A4, para o `expo-print`
 * gerar o PDF no celular. Não gera o PDF nem acessa rede/sistema de arquivos — todo
 * dado dinâmico entra via `data`.
 */
export function buildJourneyReportHtml(data: JourneyReportData): string {
  const periodLabel = formatPeriodLabel(data.period);

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Minha Jornada - ${escapeHtml(periodLabel)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="${REPORT_FONTS_URL}" rel="stylesheet" />
<style>${PRINT_DOCUMENT_CSS}</style>
</head>
<body>
${buildJourneyReportFragment(data)}
</body>
</html>`;
}
