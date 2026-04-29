# Hospedagem

O projeto esta separado em frontend Vite e API Express/Prisma.

## Frontend

- Build command: `npm install && npm run build`
- Output/public directory: `dist`
- Variaveis:
  - `VITE_API_URL`: URL publica da API, sem barra no final. Ex.: `https://centro-doacao-caps-api.onrender.com`

Os arquivos acessados por URL direta, como `/logosesau.png`, ficam em `public/` para serem copiados automaticamente pelo Vite no build.

## Backend

- Root directory: `server`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Antes de iniciar em producao, rode as migrations no banco: `npm run db:deploy`
- Variaveis obrigatorias:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - `NODE_ENV=production`
  - `TRUST_PROXY=true` quando a API estiver atras de proxy confiavel, como Render/Railway/Fly

Se front e API ficarem em dominios diferentes, `FRONTEND_URL` deve conter o dominio exato do front para CORS e cookies funcionarem.

## Banco

Use PostgreSQL. Depois de configurar `DATABASE_URL`, rode:

```bash
cd server
npm run db:deploy
npm run db:seed
```

O seed deve ser executado apenas quando quiser popular o banco inicial.
