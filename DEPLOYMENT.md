# Publicacao Web

O projeto tem tres partes de producao:

- Frontend Vite/React como site estatico.
- API Express/Prisma como servico web Node.js.
- Banco PostgreSQL gerenciado.

## Checklist rapido

1. Crie um banco PostgreSQL em uma plataforma gerenciada.
2. Publique a API usando a pasta `server`.
3. Rode as migrations da API contra o banco.
4. Rode o seed uma vez para criar unidades e admin inicial.
5. Publique o frontend usando a raiz do repositorio.
6. Acesse o admin em `https://seu-site/#/admin/login`.

Antes de publicar, rode localmente:

```bash
npm run deploy:check
```

## Frontend

Configure o servico como site estatico:

- Root directory: raiz do repositorio
- Build command: `npm install && npm run build`
- Output/public directory: `dist`

Variaveis:

```bash
VITE_API_URL="https://sua-api-publica.exemplo.com"
VITE_ENABLE_LOCAL_AUTH_BYPASS="false"
VITE_ENABLE_TELEMETRY="true"
```

Observacoes:

- `VITE_API_URL` deve ser a URL publica da API, sem barra no final.
- Use HTTPS em producao.
- O app usa `HashRouter`, entao rotas como `/#/admin/login` funcionam em hospedagem estatica sem regra extra de rewrite.

## Backend

Configure o servico Node.js usando a pasta `server`:

- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`

Variaveis obrigatorias:

```bash
NODE_ENV="production"
DATABASE_URL="postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO"
JWT_SECRET="gere_com_openssl_rand_base64_48"
FRONTEND_URL="https://seu-site-publico.exemplo.com"
TRUST_PROXY="true"
ENABLE_LOCAL_AUTH_BYPASS="false"
SEED_ADMIN_EMAIL="admin@exemplo.com"
SEED_ADMIN_PASSWORD="senha_forte_com_12_ou_mais_caracteres"
SEED_ADMIN_NAME="Administrador"
SEED_ADMIN_CAP_SLUG="c1"
```

Se houver mais de um dominio de frontend, separe em `FRONTEND_URL` por virgula:

```bash
FRONTEND_URL="https://site.com.br,https://www.site.com.br"
```

## Banco e admin inicial

Depois que a API estiver com `DATABASE_URL` configurado, rode:

```bash
cd server
npm run db:deploy
npm run db:seed
```

O seed cria/atualiza:

- Unidades CAPS e residencia terapeutica.
- Necessidades publicas iniciais.
- Conta administrativa definida por `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD`.

Use essa conta em:

```text
https://seu-site/#/admin/login
```

## Uso diario

Fluxo publico:

- Visitantes acessam a home, unidades CAPS e pagina de doacao.
- Doacoes sao registradas pela API em `/api/donations`.
- Necessidades publicas vem da API em `/api/needs`.

Fluxo admin:

- Gestor entra em `/#/admin/login`.
- A sessao fica em cookie `httpOnly`, nao em JavaScript.
- O painel permite consultar doacoes, residentes e publicar novas necessidades da unidade autenticada.
- Logout remove o cookie e limpa o estado local do navegador.

## Seguranca de producao

- Nunca publique arquivos `.env`.
- `JWT_SECRET` precisa ter pelo menos 32 caracteres.
- `FRONTEND_URL` deve bater exatamente com o dominio publico do frontend.
- `ENABLE_LOCAL_AUTH_BYPASS` deve ser sempre `false` em producao.
- Em producao, a API valida variaveis obrigatorias ao iniciar e falha antes de abrir a porta quando algo critico estiver errado.
