# silpo-mobile

App mobile do projeto Silpo (AGES — PUCRS).

## Stack

- [React Native](https://reactnative.dev/) **0.86.3** + [TypeScript](https://www.typescriptlang.org/) **6.0.3**
- [Expo SDK](https://docs.expo.dev/versions/v57.0.0/) **57.0.20** — toolchain e runtime
- [Expo Router](https://docs.expo.dev/router/introduction/) **57.0.20** — navegação (roteamento baseado em arquivos)
- [expo-sqlite](https://docs.expo.dev/versions/v57.0.0/sdk/sqlite/) **57.0.2** — banco local (offline)
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) — linter
- [Prettier](https://prettier.io/) — formatação de código
- [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/lint-staged/lint-staged) — lint/format automático antes de cada commit

> **Expo Go:** o app da App Store / Play Store pode ainda estar em um SDK anterior. Para SDK 57, use o Expo Go instalado via Expo CLI (Android / simulador iOS) ou `eas go` (dispositivo iOS).

## Requisitos

- Node.js **22.18.0** (versão fixada em [`.nvmrc`](./.nvmrc) e `package.json`)
  - Mínimo exigido pelo Expo SDK 57: **22.13.x**
  - Se usa [nvm](https://github.com/nvm-sh/nvm) ou [nvm-windows](https://github.com/coreybutler/nvm-windows): `nvm use`
- [Expo Go](https://expo.dev/go) compatível com **SDK 57** (CLI / `eas go` se a loja ainda não tiver essa versão)

## Como rodar

```bash
npm install
npm run dev
```

Escaneie o QR code com o Expo Go (Android) ou câmera (iOS).

## Scripts disponíveis

| Comando                | O que faz                                    |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | sobe o servidor de desenvolvimento (Expo)    |
| `npm run android`      | abre no emulador/dispositivo Android         |
| `npm run ios`          | abre no simulador iOS (requer macOS)         |
| `npm run web`          | abre versão web (dev)                        |
| `npm run lint`         | roda o linter (oxlint)                       |
| `npm run format`       | formata todo o código com Prettier           |
| `npm run format:check` | só verifica formatação, sem alterar arquivos |

## Estrutura

```
app/                  # rotas (Expo Router) — cada arquivo é uma rota
├── _layout.tsx       # layout raiz: carrega as fontes e monta o Stack
├── welcome.tsx       # placeholder
├── login.tsx         # placeholder
├── cadastro.tsx      # placeholder
├── index.tsx         # placeholder ("Início")
├── diario.tsx        # placeholder
├── jornada.tsx       # placeholder
├── apoio.tsx         # placeholder
├── perfil.tsx        # placeholder
└── onboarding/
    ├── etapa-1.tsx   # placeholder
    ├── etapa-2.tsx   # placeholder
    └── etapa-3.tsx   # placeholder

src/
├── components/   # UI reutilizável
├── features/     # telas e lógica de cada domínio (ver "Implementar uma tela")
├── hooks/        # hooks customizados
├── services/     # SQLite
├── theme/        # tokens de design (cores, fontes)
└── types/        # tipos TypeScript
```

## Navegação (Expo Router)

O app usa [Expo Router](https://docs.expo.dev/router/introduction/): roteamento **baseado em
arquivos**. Tudo dentro de `app/` vira rota e o nome do arquivo é o caminho da URL.

Os nomes de arquivo em `app/` (segmentos de URL) ficam **em português**, seguindo o vocabulário
da UI (`kebab-case`). O resto do código continua em inglês.

### Implementar uma tela

O arquivo de rota (`app/`) **não leva a implementação da tela** — ele só importa o componente e
devolve ele, sem lógica nenhuma. A implementação da tela fica em `src/features/<domínio>/<Nome>Screen.tsx`.

1. Crie o componente em `src/features/<domínio>/<Nome>Screen.tsx` (`PascalCase` + sufixo `Screen`,
   em inglês; export nomeado — ex.: `export function DiaryScreen() { ... }`).
2. No arquivo de rota correspondente, importe e renderize:

```tsx
import { DiaryScreen } from '@/features/diary/DiaryScreen';

export default function DiaryRoute() {
  return <DiaryScreen />;
}
```

Isso mantém `app/` só com roteamento e `src/features/`
com a tela em si — testável e reutilizável sem depender do router.

## Fluxo de branches

- `develop` — branch padrão, onde o desenvolvimento acontece
- `master` — branch de produção

## Convenções de commit/lint

Antes de cada commit, um hook (Husky) roda automaticamente lint + format nos arquivos alterados.
Se o commit for bloqueado, corrija os erros apontados e tente novamente.
