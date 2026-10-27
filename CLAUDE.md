# CLAUDE.md

## Design Context

**Project:** Centro de Doação CAPS — plataforma pública de doação de itens para unidades CAPS de Campo Grande/MS.

**Register:** product (design serves the task: donors find what to donate and to whom)

**Primary users:** Moradores de Campo Grande/MS que querem fazer doações de itens. Visitam esporadicamente, precisam entender rapidamente o que cada CAPS precisa e sair com um plano concreto.

**Brand personality:** Acolhedor, claro, presente.

**Creative North Star:** "O Quadro de Cuidados da Rede" — um mural bem cuidado numa unidade de saúde: claro, presente, confiável, humano. Sem burocracia, sem apelos emocionais.

**Tone:** Mostra fatos concretos (item, unidade, quantidade, urgência), não vende a causa. Confiança vem de informação clara, não de pressão emocional.

**Anti-references:**
- Portal governamental burocrático (azul genérico, formulários pesados, hierarquia plana)
- ONG com layout 2010 (cores desbotadas, tipografia inconsistente, imagens de stock)
- Plataforma de crowdfunding comercial (urgência artificial, contadores de progresso como apelo)

**Full context:** See [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md).

## Stack

React + TypeScript + Vite, CSS puro (sem Tailwind), React Router v7 HashRouter, Leaflet (maps), react-icons.

## Design system

- **Tokens** em `src/Styles/tokens.css` (`:root`): cores, fontes, sombras, raios, movimento, largura de layout. Nunca repita um valor literal nas páginas: crie/use um `var(--token)`.
- **Ordem da cascata** em `src/Styles/index.css` (importado uma única vez em `src/main.tsx`). Componentes e páginas **não** importam CSS. `Layout.css` (base + header/footer) carrega por último de propósito.
- Arquivos CSS por página: `Home.css` (home, necessidades, cards de pedido, mapa), `CapsPage.css`, `AboutProject.css`, `YourDonations.css`, `Login.css`, `Dashboard.css`
- Tipografia self-hosted via `@fontsource-variable` (Lexend + Source Sans 3): use `var(--font-display)` / `var(--font-body)`
- **Animações** em `src/Styles/motion.css` (carrega por último): keyframes `motion-rise-in` / `motion-fade-in` / `motion-pop-in`, tokens `--ease-out`, `--duration-*`, `--stagger-step`. Só `transform`/`opacity`, máx. 320ms, nada infinito decorativo, `prefers-reduced-motion` tratado num único bloco.
- Paleta: navy #07345f (primary), teal #0f8f79 (secondary), gold #f7bd4f (tertiary accent)
- Radius: 12px (card), 10px (control)

## Arquitetura de dados (frontend)

- `src/hooks/usePublicData.ts`: `useUnits()` / `useNeeds()` com cache compartilhado entre páginas (sem refetch nem "piscar" ao navegar). Após publicar/apagar pedidos chame `invalidatePublicNeeds()`.
- `src/services/*`: chamadas HTTP. Fallback para o catálogo local (`src/data/mockData.ts`) quando a API cai.
- `src/lib/`: `api.ts` (cliente HTTP + mensagens de erro em PT), `format.ts` (datas sem bug de fuso), `stats.ts` (indicadores calculados), `routes.ts` (caminhos), `session.ts` (sessão do gestor).
- Formulário de doação (`CapsPage.tsx`): 3 passos numerados (itens → entrega → identificação) que ganham ✓ quando completos; erros por campo aparecem só após tentar enviar.
- Conta do doador (opcional): `src/hooks/useDonorSession.tsx` (contexto em `router.tsx`), página `/entrar`, histórico em `/suas-doacoes`. API `/api/donors/*` com cookie httpOnly `donor_token` (audiência JWT própria, separada do gestor). Sem conta, o histórico fica só no aparelho (localStorage).
- Doação é enviada por `POST /api/donations/batch` (todos os itens numa transação, mesmo `groupId`).
- Rotas da doação: `/caps`, `/caps/:unidade`, `/caps/:unidade?pedido=ID` (pré-preenche o item). A URL é a fonte de verdade da unidade selecionada.
- Imagens ficam só em `public/` e são referenciadas pela raiz (`/capsmargarida.jpg`).
