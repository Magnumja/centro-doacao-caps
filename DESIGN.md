---
name: Centro de Doação CAPS
description: Conecta doadores a necessidades reais das unidades CAPS de Campo Grande/MS.
colors:
  navy-deep: "#07345f"
  navy-darkest: "#041b31"
  navy-ink: "#102a36"
  teal-accent: "#0f8f79"
  warm-gold: "#f7bd4f"
  muted-text: "#58707a"
  border: "#d7e6e4"
  page-bg: "#f3f8f6"
  page-soft: "#eaf4f1"
  surface: "#ffffff"
  surface-soft: "#f7fbfa"
  primary-tint: "#e5f1f5"
  teal-tint: "#e4f6f1"
  danger: "#b33a30"
typography:
  display:
    fontFamily: "Lexend, sans-serif"
    fontSize: "clamp(1.9rem, 4vw, 3.2rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "0"
  headline:
    fontFamily: "Lexend, sans-serif"
    fontSize: "clamp(1.52rem, 2.8vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.16
  title:
    fontFamily: "Lexend, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Source Sans 3, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Lexend, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    letterSpacing: "0"
rounded:
  control: "10px"
  card: "12px"
  pill: "999px"
spacing:
  xs: "0.35rem"
  sm: "0.65rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.navy-deep}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0.62rem 0.92rem"
  button-primary-hover:
    backgroundColor: "{colors.navy-darkest}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0.62rem 0.92rem"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy-darkest}"
    rounded: "{rounded.control}"
    padding: "0.58rem 0.82rem"
  button-secondary-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.navy-deepest}"
    rounded: "{rounded.control}"
    padding: "0.58rem 0.82rem"
  chip-category:
    backgroundColor: "{colors.primary-tint}"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.pill}"
    padding: "0.26rem 0.62rem"
  chip-category-active:
    backgroundColor: "{colors.teal-tint}"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.pill}"
    padding: "0.26rem 0.62rem"
  card-default:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "1rem"
  card-default-hover:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "1rem"
---

# Design System: Centro de Doação CAPS

## 1. Overview

**Creative North Star: "O Quadro de Cuidados da Rede"**

Imagine um mural bem cuidado numa unidade de saúde comunitária: cada pedido escrito com clareza, organizado por urgência, sempre atualizado. Quem entra sabe imediatamente o que é necessário e onde pode ajudar. Não há apelos dramáticos nem burocracia intimidante, apenas informação clara apresentada com cuidado. É dessa presença calma e organizada que este sistema visual nasce.

O sistema usa uma paleta baseada em dois polos: o navy profundo do serviço público de qualidade, que transmite credibilidade e seriedade, e o teal claro da saúde comunitária, que traz abertura e esperança. O ouro quente aparece como terceiro elemento, raramente mas com força, no header e em momentos de destaque. O fundo é levemente verde-tinto, não branco puro nem creme, mas a cor exata de uma folha de papel num serviço de saúde ambiental limpo.

Este sistema rejeita: a frieza azul-governo de portais públicos genéricos; a desolação visual de ONGs da década de 2010 com cores desbotadas e tipografia inconsistente; a urgência fabricada de plataformas de crowdfunding com contadores pulsantes e apelos emotivos agressivos. A confiança é conquistada pela clareza da informação, não por pressão emocional.

**Key Characteristics:**
- Paleta de dois tons (navy + teal) com acento quente pontual.
- Tipografia dual: Lexend para hierarquia e navegação; Source Sans 3 para leitura de conteúdo.
- Elevação estrutural (não decorativa): sombras aparecem apenas em estado de hover ou quando uma superfície precisa se destacar do fundo.
- Fundo levemente tintado de verde (não branco, não creme), criando um campo neutro de cuidado.
- Bordas suaves (12px cards, 10px controles) sem arestas corporativas nem arredondamento exagerado.
- Animações de entrada suaves e únicas por contexto; sem coreografia uniforme aplicada a tudo.

## 2. Colors

A paleta opera em dois eixos: profundidade (navy) e abertura (teal), com um acento quente pontual e um fundo neutro de baixo contraste.

### Primary
- **Navy Profundo** (`#07345f`): A cor de identidade. Usada no header, botões primários, links ativos, e todos os elementos que pedem autoridade ou ação. Transmite credibilidade institucional sem frieza.
- **Navy Escuro** (`#041b31`): Variante de pressão e hover. Usado como cor de hover nos botões primários e como sombra semântica no header. Nunca como fundo de conteúdo.
- **Navy Tinta** (`#102a36`): Cor de texto principal do corpo. Mais escura que o muted mas mais quente que o preto puro. Todos os títulos e parágrafos principais usam esta cor.

### Secondary
- **Teal Acento** (`#0f8f79`): Cor de estado positivo, foco ativo, e identidade secundária. Usado em bordas de foco, hover de links, progress bars e badges "done". Nunca usada de forma decorativa; sempre semântica.

### Tertiary
- **Ouro Quente** (`#f7bd4f`): O acento mais raro do sistema. Aparece exclusivamente no header nav (underline de link ativo/hover) e no progress bar de destaque. Sua escassez é o ponto; dilua e perde o impacto.

### Neutral
- **Texto Muted** (`#58707a`): Metadados, legendas, copy secundário. Nunca usado como texto de corpo principal. Contraste mínimo 4.5:1 contra `#f3f8f6`.
- **Border** (`#d7e6e4`): Separadores e bordas de card em repouso. Nunca decorativa sem função divisória.
- **Fundo Página** (`#f3f8f6`): O canvas. Levemente tintado de verde, não branco puro. Cria a sensação de documento em ambiente de cuidado.
- **Superfície Card** (`rgba(255, 255, 255, 0.94)`): Cards e painéis elevados sobre o fundo. Quase branco, suficientemente opaco para não precisar de blur.
- **Superfície Soft** (`#f7fbfa`): Segunda camada de superfície dentro de um card (meta-data pills, itens de lista, campos de input inativo).
- **Primary Tint** (`#e5f1f5`): Fundo de chips/badges de categoria. Derivado do navy, não do teal.
- **Teal Tint** (`#e4f6f1`): Chip/badge em estado ativo ou positivo. Derivado do teal.
- **Danger** (`#b33a30`): Estado de erro e urgência alta. Nunca decorativo.

**A Regra do Ouro Escasso.** `warm-gold` (#f7bd4f) pode aparecer em no máximo um elemento por viewport. Se você encontrar dois elementos dourados visíveis ao mesmo tempo, um deles está errado.

**A Regra do Teal Semântico.** `teal-accent` (#0f8f79) é reservado para estados: foco, hover de link, progresso positivo, sucesso. Nunca use como cor decorativa de fundo ou de ícone em repouso.

## 3. Typography

**Display/Nav Font:** Lexend (700, 600)
**Body Font:** Source Sans 3 (400, 600)

**Character:** O par funciona por contraste de propósito: Lexend carrega autoridade, direção e chamada para ação; Source Sans 3 carrega conteúdo, descrição e leitura. São distinguíveis sem conflitar.

### Hierarchy
- **Display** (Lexend 700, `clamp(1.9rem, 4vw, 3.2rem)`, lh 1.08): Títulos de página e heroes. Máximo 1 por página. Usar `text-wrap: balance`.
- **Headline** (Lexend 700, `clamp(1.52rem, 2.8vw, 2.25rem)`, lh 1.16): Títulos de seção. Máximo 3-4 por página. Usar `text-wrap: balance`.
- **Title** (Lexend 700, `1rem–1.06rem`, lh 1.2): Títulos de card, nome de unidade, item de necessidade. Presente em múltiplos por viewport.
- **Body** (Source Sans 3 400, `1rem`, lh 1.6): Texto corrido de parágrafos, descrições, copy de seção. Linha máxima 65–75ch. Usar `text-wrap: pretty` em blocos longos.
- **Label** (Lexend 700, `0.72rem–0.82rem`, lh 1.2, sem letter-spacing extra): Badges, chips, metadados, tabs. Nunca em CAPS para body copy; apenas em labels curtos (≤4 palavras).

**A Regra das Duas Famílias.** Este sistema usa exatamente duas famílias: Lexend e Source Sans 3. Não adicione uma terceira. Qualquer necessidade de diferenciação visual deve ser satisfeita por variação de peso, tamanho ou cor dentro dessas duas famílias.

**A Regra do Clamp com Teto.** `clamp()` em headings tem teto de `3.2rem` no display e `2.25rem` na headline. Acima disso, o título grita. Adicionar mais `vw` ao clamp não torna o heading mais expressivo; torna-o menos legível em viewports grandes.

## 4. Elevation

O sistema usa sombras estruturais, não decorativas. Superfícies são planas em repouso; sombras aparecem apenas quando uma superfície precisa comunicar elevação real (hover, modal, sticky header).

**Fundo tintado como elevação zero.** O `page-bg` (#f3f8f6) é a base. Cards em `surface` (rgba(255,255,255,0.94)) já "flutuam" visualmente sem sombra, porque o contraste de cor é suficiente. Sombra é adicionada apenas quando o card precisa responder ao hover ou quando está genuinamente elevado sobre conteúdo (ex: header sticky).

### Shadow Vocabulary
- **Soft** (`0 10px 28px rgba(9, 36, 61, 0.08)`): Estado de repouso para cards de conteúdo quando a hierarquia pede reforço. Usado com moderação; a maioria dos cards não tem sombra em repouso.
- **Card** (`0 18px 46px rgba(9, 36, 61, 0.11)`): Hover state e cards de destaque. Aplicada via `transition` para que o lift seja perceptível.
- **Hover** (`0 22px 52px rgba(9, 36, 61, 0.14)`): Estado de hover explícito. Toda sombra de hover usa `translateY(-2px)` a `-4px` junto com ela.

**A Regra do Lift Combinado.** Nunca aplique sombra de hover sem `transform: translateY(Npx)`. Sombra sem movement parece erro de CSS. Movement sem sombra parece artefato. Os dois sempre juntos.

**Proibido: backdrop-filter em cards de conteúdo.** Glassmorphism em cards sobre fundo sólido é decorativo e caro em paint. Reservado exclusivamente ao header sticky, onde o conteúdo realmente rola por baixo dele.

## 5. Components

### Buttons

Botões são a ação principal do sistema. Devem ser claramente distinguíveis uns dos outros e do conteúdo ao redor.

- **Shape:** Gently rounded (10px radius, `--radius-control`). Nem quadrado corporativo nem pill excessivamente arredondado.
- **Primary:** Navy profundo (#07345f) com texto branco. Padding `0.62rem 0.92rem`. Gradiente sutil no estado final: `linear-gradient(135deg, rgba(255,255,255,0.12), transparent 45%), navy para teal escuro`.
- **Hover/Focus:** `translateY(-2px)` + shadow-card. Focus-visible: outline 3px teal rgba(15,143,121,0.28) com offset 3px.
- **Secondary/Ghost:** Fundo surface (branco translúcido), borda border (#d7e6e4), texto navy-darkest. No hover: borda teal suave + shadow-soft leve.
- **Label convention:** Sempre verbo + objeto. "Ver necessidades", "Quero doar", "Escolher unidade". Nunca "OK", "Enviar", "Sim".

### Chips / Badges de Filtro

- **Style em repouso:** Fundo primary-tint (#e5f1f5), texto navy-deep, border-radius pill (999px). Fonte Lexend 700 0.72rem.
- **Estado ativo:** Borda teal (#0f8f79) 35% opacidade, fundo teal-tint (#e4f6f1), texto navy-deep.
- **Urgência alta:** Background #ffe8e5, texto #9a2f27. Urgência média: #fff5d8, texto #785d11. Urgência baixa: #e8f2ff, texto #2d5f86.

### Cards de Conteúdo

- **Corner Style:** Suavemente arredondado (12px, `--radius-card`).
- **Background:** Surface (rgba(255,255,255,0.94)), com gradiente leve `linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,251,250,0.9))` nos cards de destaque.
- **Shadow Strategy:** Sem sombra em repouso por padrão. Shadow-soft em cards de seção destacada. Shadow-card + translateY em hover.
- **Border:** 1px solid border (#d7e6e4) em repouso; border-color teal 24% no hover. Sem side-stripes.
- **Priority indicator:** Barra de 3px no topo via `::before` pseudo-elemento. Vermelha (alta), âmbar (média), azul (baixa). Nunca na lateral.
- **Internal Padding:** 0.9rem–1rem no padrão. 0.68rem–0.75rem na variante compacta.

### Inputs / Campos

- **Style:** Border 1px solid rgba(16,42,54,0.14), radius 10px, background rgba(255,255,255,0.94). Min-height 44px (48px no login).
- **Hover:** Border-color navy 28% opacidade.
- **Focus:** Border-color teal 66% + box-shadow 0 0 0 4px rgba(15,143,121,0.12). Nunca outline padrão do browser; sempre substituído por este anel.
- **Disabled:** opacity 0.62, cursor not-allowed. Sem background diferente.

### Navegação (Header)

- **Desktop:** Grid 3 colunas (links esquerda / logo centro / links direita). Fundo navy gradiente escuro. Links em `rgba(255,255,255,0.94)`.
- **Link ativo/hover:** Texto `#ffd872` (ouro claro). Underline 2px bottom via `::after` animado `right: 100% → 0` em 180ms ease.
- **Mobile (≤860px):** Drawer lateral. Background surface. Links em navy-ink. Active/hover: primary-tint + navy-darkest.
- **Sticky:** `backdrop-filter: blur(10px)` no header desktop, onde o conteúdo rola por baixo. Este é o único lugar legítimo de glassmorphism no sistema.

### Cards de Necessidade de Doação (componente assinatura)

O componente central do produto. Cada card representa um pedido real de uma unidade CAPS.

- Barra de 3px no topo (`::before`) indica prioridade: vermelha/âmbar/azul. Nunca side-stripe.
- Badges arredondados para categoria e urgência, com fundo tintado e texto de alta legibilidade.
- Progress bar (0.36rem) com gradiente navy→teal indica percentual doado.
- Meta-data em grid de 2 colunas: `dt` muted 0.78rem, `dd` Lexend bold.
- Hover: `translateY(-4px)` + shadow-hover + border-color teal 24%.

## 6. Do's and Don'ts

### Do:
- **Do** usar Lexend para todos os elementos de hierarquia, navegação, labels e botões. Source Sans 3 apenas para corpo de texto e descrições longas.
- **Do** usar `text-wrap: balance` em todos os h1–h3 para evitar linhas desequilibradas.
- **Do** usar a barra de 3px no topo via `::before` para indicar prioridade em cards. Nunca side-stripe.
- **Do** testar contraste de texto muted (#58707a) contra o fundo exato onde aparece. Mínimo 4.5:1 contra `page-bg` (#f3f8f6).
- **Do** combinar `transform: translateY(Npx)` com toda sombra de hover. Lift sem sombra ou sombra sem lift são igualmente erros.
- **Do** reservar `warm-gold` (#f7bd4f) exclusivamente para o underline de nav ativo/hover no header. Máximo um elemento dourado visível por viewport.
- **Do** manter `prefers-reduced-motion` em toda animação: crossfade ou transição instantânea como alternativa.
- **Do** usar `min-height: 44px` em todos os elementos interativos no mobile. Touch targets menores são bugs de acessibilidade, não escolhas de design.

### Don't:
- **Não** use `border-left` ou `border-right` maior que 1px como acento colorido em cards, alertas ou listas. Side-stripes estão proibidas. Use barra de topo via `::before` ou background tint.
- **Não** use `backdrop-filter` em cards de conteúdo. Glassmorphism em superfície opaca não tem efeito visual e custa paint. Reservado ao header sticky exclusivamente.
- **Não** use `background-clip: text` com gradiente. Gradient text está proibido. Ênfase por peso ou tamanho.
- **Não** crie grelhas de cards idênticos (ícone + título + texto) sem diferenciação visual entre itens. Se os cards são todos iguais em estrutura, questione se o card é o affordance certo.
- **Não** adicione kicker `page-kicker` a mais de 2 seções por página. Um kicker por seção é AI grammar. Use headings que falem por si mesmos.
- **Não** use `clamp()` com máximo acima de 3.2rem em headings. Acima disso, o título grita.
- **Não** crie um terceiro font-family. Lexend + Source Sans 3 é o sistema completo.
- **Não** coloque texto colorido (`color: #666` ou similar) sobre fundo colorido sem verificar contraste. Muted sobre tinted-bg requer cálculo, não estimativa.
- **Não** imite portais governamentais burocráticos: formulários pesados, azul institucional genérico, hierarquia tipográfica plana.
- **Não** imite ONGs desatualizadas: cores desbotadas, layout de blog 2010, tipografia inconsistente, imagens de stock com mãos entrelaçadas.
- **Não** imite plataformas de crowdfunding comercial: contadores de progresso como apelo emocional, urgência artificial, CTAs agressivos. O site mostra fatos, não vende a causa.
