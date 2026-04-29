# Centro Doação — Vite + React

Projeto inicial criado no repositório. Contém uma configuração mínima de Vite com React.

Como usar:

1. Instalar dependências

   npm install

2. Rodar somente o frontend em modo desenvolvimento

   npm run dev

3. Rodar frontend + API em modo desenvolvimento

   npm run dev:all

4. Gerar build de produção

   npm run build

5. Visualizar build localmente

   npm run preview

6. Validar build de publicacao do frontend e da API

   npm run deploy:check

Para publicar o projeto, siga o checklist em `DEPLOYMENT.md`.

Observações:
- Repositório inicializado sem alterar histórico git local.
- Arquivos adicionados: package.json, vite.config.js, index.html, src/, .gitignore

## Instruções para quem for usar/criar páginas

Este projeto usa uma navbar global para manter o menu padrão em todas as páginas principais.

Regras do layout:
- A navbar está em `src/components/Layout.tsx`.
- O estilo da navbar está em `src/Styles/Layout.css`.
- A imagem da marca usada na navbar está em `public/SESAU.png` (acesso via `"/SESAU.png"`).
- As rotas que devem exibir o menu ficam dentro do bloco `Route element={<Layout />}` em `src/app/router.tsx`.
- A rota de login administrativo (`/admin/login`) também fica dentro do layout global para manter a navbar.

Como criar uma nova página com o menu geral:
1. Crie o arquivo da página em `src/pages` (ou subpastas).
2. Estruture o conteúdo com `<section className="page-block">...</section>` para herdar o padrão visual.
3. Adicione a rota da página dentro do bloco que usa `<Layout />` em `src/app/router.tsx`.
4. Se quiser que apareça no menu, inclua o item no array `navigationItems` em `src/components/Layout.tsx`.

Boas práticas:
- Não encapsule páginas manualmente com `<Layout />`; o roteador já faz isso.
- Use labels com acentuação correta no menu para manter consistência de idioma.
