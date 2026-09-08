/**
 * Paleta do Silpo.
 *
 * Os valores foram lidos dos frames de autenticação no Figma — `Welcome`
 * (4346:11267) e `Cadastro` (4236:951), na página "📱 Rascunhos - Mobile". Esses
 * frames não usam variáveis de cor: a coleção "Cores" do Design System está
 * desatualizada em relação a eles, então a fonte de verdade é o hexadecimal dos
 * próprios nós.
 *
 * As três exceções estão comentadas — o design não define estado pressionado
 * nem cor de erro, exigidos pelo comportamento das telas.
 */
export const colors = {
  background: {
    canvas: '#F4F8F3',
    surface: '#FFFFFF',
    support: '#EEEBF5',
    badge: '#F4F8F3',
  },
  brand: {
    primary: '#3F6B57',
    /** Derivada da primária (~15% mais escura): o Figma não define o pressionado. */
    primaryPressed: '#365B4A',
  },
  text: {
    primary: '#1F3329',
    secondary: '#55685D',
    muted: '#9AAAA0',
    inverse: '#FFFFFF',
    support: '#4F4478',
    /** Sem equivalente no Figma: as telas não desenham o estado de erro. */
    danger: '#B3261E',
  },
  border: {
    subtle: '#DEE8DF',
    brand: '#3F6B57',
    /** Mesma ressalva da cor de texto de erro. */
    danger: '#B3261E',
  },
  decorative: {
    circleOuter: '#E3F0E7',
    circleInner: '#CDEBD3',
  },
} as const;
