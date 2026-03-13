# Centro de Doação CAPS — API

Back-end REST construído com **Node.js + Express + TypeScript + Prisma + PostgreSQL**.

---

## Requisitos

- Node.js ≥ 20
- PostgreSQL ≥ 14 rodando localmente (ou via Docker)

---

## Primeiro uso

```bash
# 1. Entrar na pasta
cd server

# 2. Instalar dependências
npm install

# 3. Copiar .env e preencher os valores
cp .env.example .env

# 4. Gerar o client do Prisma
npm run db:generate

# 5. Criar as tabelas no banco
npm run db:migrate

# 6. Popular o banco com dados iniciais (mesmos do mock.ts)
npm run db:seed

# 7. Subir o servidor em modo desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3333`.

---

## Rotas disponíveis

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/health` | — | Healthcheck |
| `POST` | `/api/auth/login` | — | Login (devolve cookie JWT) |
| `POST` | `/api/auth/logout` | — | Logout |
| `GET` | `/api/auth/me` | ✅ | Dados do host logado |
| `GET` | `/api/units` | — | Lista todas as unidades |
| `GET` | `/api/units/:slug` | — | Detalhes de uma unidade |
| `GET` | `/api/needs` | — | Lista necessidades (aceita `?priority=alta&unitId=...`) |
| `POST` | `/api/donations` | — | Registra nova doação (público) |
| `GET` | `/api/donations` | ✅ | Lista doações da unidade do host |
| `DELETE` | `/api/donations/:id` | ✅ | Remove uma doação |
| `GET` | `/api/residents` | ✅ | Lista residentes da unidade |
| `POST` | `/api/residents` | ✅ | Cadastra residente |
| `PUT` | `/api/residents/:id` | ✅ | Atualiza residente |
| `DELETE` | `/api/residents/:id` | ✅ | Remove residente |

---

## Segurança implementada

- **bcrypt** (rounds = 12) para senhas
- **JWT** em `httpOnly` cookie (sem acesso via JS do navegador)
- **Helmet** para headers HTTP seguros
- **CORS** restrito ao domínio do front
- **Rate limiting**: 10 tentativas de login / 15 min · 200 req gerais / 15 min
- **Zod** para validação de todos os inputs
- **Prepared statements** via Prisma (proteção contra SQL Injection)
- Escopo por `unitId`: host só acessa dados da própria unidade
