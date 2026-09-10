| Elemento                  | React / React Native (TS) | Python             | Formato / Regra                                     | Exemplos                                   |
| ------------------------- | ------------------------- | ------------------ | --------------------------------------------------- | ------------------------------------------ |
| **Branch**                | Igual                     | Igual              | `<tipo>/<descricao>` em `kebab-case`                | `feat/user-login` · `fix/token-expiration` |
| **Commit**                | Igual                     | Igual              | `<tipo>: <descricao>` seguindo Conventional Commits | `feat: add user authentication`            |
| **Nome do PR**            | Igual                     | Igual              | `[TIPO] Descrição objetiva`                         | `[FEAT] Adiciona autenticação do usuário`  |
| **Variável**              | `camelCase`               | `snake_case`       | Nome descritivo; evitar abreviações sem necessidade | `userName` · `user_name`                   |
| **Booleano**              | `camelCase`               | `snake_case`       | Preferir prefixos `is`, `has`, `can`, `should`      | `isActive` · `is_active`                   |
| **Função**                | `camelCase`               | `snake_case`       | Preferencialmente iniciar com verbo                 | `calculatePrice()` · `calculate_price()`   |
| **Método**                | `camelCase`               | `snake_case`       | Mesmo padrão de funções                             | `validateToken()` · `validate_token()`     |
| **Handler de evento**     | `handleSomething`         | —                  | Usar prefixo `handle` para ações da interface       | `handleSubmit` · `handleLogin`             |
| **Classe**                | `PascalCase`              | `PascalCase`       | Nome representando entidade ou responsabilidade     | `UserService`                              |
| **Constante global**      | `UPPER_SNAKE_CASE`        | `UPPER_SNAKE_CASE` | Configurações e valores fixos compartilhados        | `MAX_LOGIN_ATTEMPTS`                       |
| **`const` local**         | `camelCase`               | —                  | Não usar `UPPER_SNAKE_CASE` apenas por ser `const`  | `const userName = "Andre"`                 |
| **Componente React**      | `PascalCase`              | —                  | Nome representando o componente visual              | `UserProfile`                              |
| **Arquivo de componente** | `PascalCase.tsx`          | —                  | Mesmo nome do componente principal                  | `UserProfile.tsx`                          |
| **Screen React Native**   | `PascalCase` + `Screen`   | —                  | Sufixo `Screen` obrigatório para telas              | `LoginScreen.tsx`                          |
| **Arquivo Python**        | —                         | `snake_case.py`    | Nunca usar `PascalCase` ou hífen                    | `price_calculator.py`                      |
| **Variável de ambiente**  | `UPPER_SNAKE_CASE`        | `UPPER_SNAKE_CASE` | Nome explícito e sem valores sensíveis no código    | `API_BASE_URL` · `DATABASE_URL`            |
| **Idioma do código**      | Inglês                    | Inglês             | Nomes técnicos sempre em inglês                     | `getUserById`, não `buscarUsuarioPorId`    |

## Arquivos de rota (Expo Router)

Os arquivos dentro de `app/` seguem a convenção do **Expo Router**, não a de componentes:

- o nome do arquivo é um segmento de URL, então usa `kebab-case` e **fica em português**, acompanhando o vocabulário da UI (`app/dados-pessoais.tsx` → `/dados-pessoais`). É a exceção à regra "idioma do código: inglês" — o resto (funções, variáveis, `src/`) continua em inglês;
- arquivos especiais mantêm o nome do framework: `_layout.tsx`, grupos entre parênteses (ex.: `(tabs)`) quando existirem;
- o arquivo de rota **não implementa a tela** — ele só importa o componente de `src/features/<domínio>/<Nome>Screen.tsx` (`PascalCase` + sufixo `Screen`, em inglês) e o renderiza:

  ```tsx
  import { DiaryScreen } from '@/features/diary/DiaryScreen';

  export default function DiaryRoute() {
    return <DiaryScreen />;
  }
  ```

  Isso mantém `app/` só com roteamento e a tela em si (lógica, estado, sub-componentes) em `src/features/`, testável sem depender do router.
