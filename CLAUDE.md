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

- Tokens em `src/Styles/Layout.css` (:root)
- Arquivos CSS por página: `Home.css`, `CapsPage.css`, `AboutProject.css`, `YourDonations.css`, `Login.css`
- Tipografia: Lexend (display/nav) + Source Sans 3 (body) via Google Fonts
- Paleta: navy #07345f (primary), teal #0f8f79 (secondary), gold #f7bd4f (tertiary accent)
- Radius: 12px (card), 10px (control)
