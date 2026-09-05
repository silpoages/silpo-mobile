# silpo-mobile

App mobile do projeto Silpo (AGES — PUCRS).

## Stack

- [React Native](https://reactnative.dev/) **0.86.3** + [TypeScript](https://www.typescriptlang.org/) **6.0.3**
- [Expo SDK](https://docs.expo.dev/versions/v57.0.0/) **57.0.20** — toolchain e runtime
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
src/
├── components/   # UI reutilizável
├── features/     # módulos de domínio
├── hooks/        # hooks customizados
├── services/     # SQLite
└── types/        # tipos TypeScript
```

## Fluxo de branches

- `develop` — branch padrão, onde o desenvolvimento acontece
- `master` — branch de produção

## Convenções de commit/lint

Antes de cada commit, um hook (Husky) roda automaticamente lint + format nos arquivos alterados.
Se o commit for bloqueado, corrija os erros apontados e tente novamente.
