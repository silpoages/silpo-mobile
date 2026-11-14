import { EMOTIONS } from '@/components/emotions/emotionConfig';
import type { MoodId } from '@/components/emotions/moodLogService';
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
};

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

function buildAchievementsSection(data: JourneyReportData): string {
  const progress = `${data.achievements.unlocked} de ${data.achievements.total} ${pluralize(data.achievements.total, 'descoberta', 'descobertas')}`;

  return `
    <div class="card achievements-card">
      <span class="achievements-badge">★</span>
      <div>
        <h2 class="section-title">Minhas conquistas</h2>
        <p class="achievements-progress">${escapeHtml(progress)}</p>
      </div>
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

const REPORT_CSS = `
  @page {
    size: A4;
    margin: 16mm;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    background: ${colors.background};
    color: ${colors.text};
    font-family: 'Nunito', -apple-system, sans-serif;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    padding-bottom: 20mm;
  }

  .header {
    display: flex;
    align-items: center;
    gap: ${spacing.lg}px;
    margin-bottom: ${spacing.xxl}px;
    break-after: avoid;
  }

  .logo {
    width: 56px;
    height: 56px;
    object-fit: contain;
    /* O PNG tem margem transparente embaixo (mesma razão do BrandLogo.tsx). */
    margin-bottom: -8px;
  }

  .header-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .title {
    margin: 0;
    font-weight: 800;
    font-size: ${fontSize.display}px;
  }

  .subtitle {
    margin: 0;
    font-weight: 700;
    font-size: ${fontSize.lg}px;
    color: ${colors.primary};
    overflow-wrap: anywhere;
  }

  .period {
    margin: 0;
    font-weight: 400;
    font-size: ${fontSize.body}px;
    color: ${colors.textSecondary};
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: ${spacing.xl}px;
  }

  .card {
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: 16px;
    padding: 18px;
    break-inside: avoid;
  }

  .metrics-row {
    display: flex;
    gap: ${spacing.lg}px;
    break-inside: avoid;
  }

  .metric-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${spacing.xs}px;
  }

  .metric-value {
    font-weight: 800;
    font-size: ${fontSize.display}px;
    color: ${colors.primary};
  }

  .metric-label {
    font-weight: 400;
    font-size: ${fontSize.md}px;
    color: ${colors.textSecondary};
    line-height: 18px;
  }

  .section-title {
    margin: 0 0 ${spacing.lg}px;
    font-weight: 700;
    font-size: ${fontSize.lg}px;
  }

  .mood-rows {
    display: flex;
    flex-direction: column;
    gap: ${spacing.lg}px;
  }

  .mood-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mood-label {
    width: 76px;
    flex-shrink: 0;
    font-size: ${fontSize.md}px;
  }

  .mood-track {
    flex: 1;
    display: block;
    height: 8px;
    border-radius: ${radii.pill}px;
    background: ${colors.surfaceMuted};
    overflow: hidden;
  }

  .mood-fill {
    display: block;
    height: 100%;
    border-radius: ${radii.pill}px;
    background: ${colors.chartFill};
  }

  .mood-count {
    min-width: 16px;
    text-align: right;
    font-weight: 600;
    font-size: ${fontSize.sm}px;
    color: ${colors.textSecondary};
    font-variant-numeric: tabular-nums;
  }

  .footnote {
    margin: 0;
    font-size: ${fontSize.sm}px;
    color: ${colors.textSecondary};
  }

  .achievements-card {
    display: flex;
    align-items: center;
    gap: ${spacing.lg}px;
  }

  .achievements-badge {
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

  .achievements-progress {
    margin: 4px 0 0;
    font-size: ${fontSize.md}px;
    color: ${colors.textSecondary};
  }

  .empty-card {
    text-align: center;
    padding: 32px 18px;
  }

  .empty-title {
    margin: 0 0 ${spacing.md}px;
    font-weight: 600;
    font-size: ${fontSize.md}px;
  }

  .empty-subtitle {
    margin: 0;
    font-weight: 400;
    font-size: ${fontSize.body}px;
    color: ${colors.textSecondary};
    line-height: 20px;
  }

  .footer {
    position: fixed;
    bottom: 8mm;
    left: 0;
    right: 0;
    text-align: center;
    font-size: ${fontSize.xs}px;
    color: ${colors.textMuted};
  }
`;

/**
 * Monta o HTML+CSS do relatório "Minha Jornada" em A4, para a task de geração
 * de PDF passar adiante a `expo-print` (ou equivalente). Não gera o PDF nem
 * acessa rede/sistema de arquivos — todo dado dinâmico entra via `data`.
 */
export function buildJourneyReportHtml(data: JourneyReportData): string {
  const periodLabel = formatPeriodLabel(data.period);
  const userName = escapeHtml(data.userName.trim());

  const bodyContent = isJourneyReportEmpty(data)
    ? buildEmptyState(periodLabel)
    : `${buildMetricsSection(data)}${buildMoodSection(data.moodCounts)}${buildAchievementsSection(data)}`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Minha Jornada - ${escapeHtml(periodLabel)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>${REPORT_CSS}</style>
</head>
<body>
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
</body>
</html>`;
}
