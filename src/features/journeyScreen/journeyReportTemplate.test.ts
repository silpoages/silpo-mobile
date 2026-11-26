import type { Achievement } from '@/features/achievements/achievementsService';
import {
  buildJourneyReportFragment,
  buildJourneyReportHtml,
  REPORT_FONTS_URL,
  REPORT_ROOT_CLASS,
  type JourneyReportData,
} from './journeyReportTemplate';

function achievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: 'a1',
    name: 'Primeiro passo',
    description: 'Registre uma emoção',
    icon: 'star',
    category: 'mood',
    unlocked: true,
    progress: { current: 1, target: 1 },
    unlockedAt: '2026-03-05T12:00:00',
    ...overrides,
  };
}

function reportData(overrides: Partial<JourneyReportData> = {}): JourneyReportData {
  return {
    daysRegistered: 5,
    practicesTried: 1,
    exercisesCompleted: 3,
    moodCounts: { BEM: 2, FELIZ: 4, TRISTE: 0 },
    achievements: { unlocked: 1, total: 3 },
    userName: '  Ana Souza  ',
    period: { month: '2026-03', startDate: '2026-03-01', endDate: '2026-03-31' },
    logoDataUri: 'data:image/png;base64,AAA',
    achievementList: [],
    ...overrides,
  };
}

describe('buildJourneyReportFragment', () => {
  it('monta o cabeçalho com logo, nome sem espaços extras e período por extenso', () => {
    const html = buildJourneyReportFragment(reportData());

    expect(html.startsWith(`<div class="${REPORT_ROOT_CLASS}">`)).toBe(true);
    expect(html).toContain('<img class="logo" src="data:image/png;base64,AAA" alt="Silpo" />');
    expect(html).toContain('<p class="subtitle">Ana Souza</p>');
    expect(html).toContain('<p class="period">Março de 2026</p>');
    expect(html).toContain('Silpo • Minha Jornada • Março de 2026');
  });

  it('mostra as métricas com singular/plural', () => {
    const html = buildJourneyReportFragment(reportData());

    expect(html).toContain('<span class="metric-value">5</span>');
    expect(html).toContain('dias com emoção registrada');
    expect(html).toContain('prática diferente realizada');
    expect(html).toContain('exercícios concluídos');
  });

  it('usa os singulares quando cada métrica vale 1', () => {
    const html = buildJourneyReportFragment(
      reportData({ daysRegistered: 1, practicesTried: 2, exercisesCompleted: 1 }),
    );

    expect(html).toContain('dia com emoção registrada');
    expect(html).toContain('práticas diferentes realizadas');
    expect(html).toContain('exercício concluído');
  });

  it('ordena as emoções pela contagem e calcula a barra relativa à maior', () => {
    const html = buildJourneyReportFragment(reportData());

    const felizIndex = html.indexOf('<span class="mood-label">Feliz</span>');
    const bemIndex = html.indexOf('<span class="mood-label">Bem</span>');
    expect(felizIndex).toBeGreaterThan(-1);
    expect(bemIndex).toBeGreaterThan(felizIndex);
    expect(html).not.toContain('<span class="mood-label">Tristeza</span>');
    expect(html).toContain('style="width:100%"');
    expect(html).toContain('style="width:50%"');
  });

  it('sem emoções registradas, mostra a nota no lugar das barras', () => {
    const html = buildJourneyReportFragment(reportData({ moodCounts: {} }));

    expect(html).toContain('Nenhuma emoção registrada neste período.');
    expect(html).not.toContain('class="mood-rows"');
  });

  it('com tudo zerado, mostra o estado vazio (e ainda as conquistas)', () => {
    const html = buildJourneyReportFragment(
      reportData({
        daysRegistered: 0,
        practicesTried: 0,
        exercisesCompleted: 0,
        achievements: { unlocked: 0, total: 1 },
        achievementList: [achievement({ unlocked: false, unlockedAt: null })],
      }),
    );

    expect(html).toContain('Sua jornada começa aqui');
    expect(html).toContain('Nenhum registro em Março de 2026 ainda.');
    expect(html).not.toContain('metrics-row"');
    expect(html).toContain('0 de 1 descoberta');
  });

  it('lista conquistas desbloqueadas antes das bloqueadas, com status e progresso', () => {
    const html = buildJourneyReportFragment(
      reportData({
        achievements: { unlocked: 2, total: 4 },
        achievementList: [
          achievement({
            id: 'locked',
            name: 'Bloqueada',
            unlocked: false,
            unlockedAt: null,
            progress: { current: 3, target: 4 },
          }),
          achievement({ id: 'dated', name: 'Com data' }),
          achievement({ id: 'nodate', name: 'Sem data', unlockedAt: null }),
          achievement({
            id: 'zero',
            name: 'Meta zero',
            unlocked: false,
            unlockedAt: null,
            progress: { current: 2, target: 0 },
          }),
        ],
      }),
    );

    expect(html).toContain('2 de 4 descobertas');
    expect(html.indexOf('Com data')).toBeLessThan(html.indexOf('Bloqueada'));
    expect(html.indexOf('Sem data')).toBeLessThan(html.indexOf('Bloqueada'));
    expect(html).toContain('Desbloqueada em 05/03/2026');
    expect(html).toContain('<p class="achievement-status">Desbloqueada</p>');
    expect(html).toContain('<span class="achievement-progress-label">3 de 4</span>');
    expect(html).toContain('class="achievement-fill" style="width:75%"');
    expect(html).toContain('class="achievement-fill" style="width:0%"');
  });

  it('limita a barra de progresso a 100%', () => {
    const html = buildJourneyReportFragment(
      reportData({
        achievementList: [
          achievement({ unlocked: false, unlockedAt: null, progress: { current: 9, target: 3 } }),
        ],
      }),
    );

    expect(html).toContain('class="achievement-fill" style="width:100%"');
  });

  it('sem conquistas, não renderiza a lista', () => {
    const html = buildJourneyReportFragment(reportData({ achievementList: [] }));

    expect(html).not.toContain('class="achievement-list"');
    expect(html).toContain('1 de 3 descobertas');
  });

  it('escapa HTML do nome e das conquistas', () => {
    const html = buildJourneyReportFragment(
      reportData({
        userName: `<b>"Zé" & 'Cia'</b>`,
        achievementList: [achievement({ name: '<script>', description: 'a & b' })],
      }),
    );

    expect(html).toContain('&lt;b&gt;&quot;Zé&quot; &amp; &#39;Cia&#39;&lt;/b&gt;');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('a &amp; b');
    expect(html).not.toContain('<script>');
  });

  it.each([
    ['mês inválido', '2026-13'],
    ['sem mês', '2026'],
  ])('mantém o texto original do período quando %s', (_label, month) => {
    const html = buildJourneyReportFragment(
      reportData({ period: { month, startDate: '', endDate: '' } }),
    );

    expect(html).toContain(`<p class="period">${month}</p>`);
  });

  it('mantém o texto original quando falta o ano', () => {
    const html = buildJourneyReportFragment(
      reportData({ period: { month: '-03', startDate: '', endDate: '' } }),
    );

    expect(html).toContain('<p class="period">-03</p>');
  });
});

describe('buildJourneyReportHtml', () => {
  it('envolve o fragmento num documento A4 completo com a fonte', () => {
    const data = reportData();
    const html = buildJourneyReportHtml(data);

    expect(html.startsWith('<!doctype html>')).toBe(true);
    expect(html).toContain('<html lang="pt-BR">');
    expect(html).toContain('<title>Minha Jornada - Março de 2026</title>');
    expect(html).toContain(`<link href="${REPORT_FONTS_URL}" rel="stylesheet" />`);
    expect(html).toContain('size: A4;');
    expect(html).toContain(buildJourneyReportFragment(data));
  });
});
