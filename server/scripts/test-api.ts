#!/usr/bin/env tsx
/*
  Script de teste: faz login com o host de seed, cria uma doação pública e
  busca as doações autenticadas. Use: `npx tsx scripts/test-api.ts` ou
  `npm run test:api` (script adicionado ao package.json).
*/
async function main(): Promise<void> {
  const base = 'http://localhost:3333'

  // 1) Login
  console.log('-> Fazendo login como teste@caps.br')
  const loginRes = await fetch(base + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teste@caps.br', password: 'senha123' }),
  })

  const loginBody = await loginRes.text()
  console.log('Login status:', loginRes.status)
  console.log('Login body:', loginBody)

  const setCookie = loginRes.headers.get('set-cookie')
  if (!setCookie) {
    console.warn('Nenhum cookie recebido — login pode ter falhado. Saindo.')
    return
  }

  // Extrai apenas o par name=value para enviar em Cookie header.
  const cookieValue = setCookie.split(';')[0]
  console.log('Cookie recebida:', cookieValue)

  // 2) Verificar doações (autenticado) antes de criar
  console.log('\n-> GET /api/donations (autenticado) — antes')
  const listBefore = await fetch(base + '/api/donations', { headers: { Cookie: cookieValue } })
  console.log('Status:', listBefore.status)
  console.log('Body:', await listBefore.text())

  // 3) Criar doação pública (rota aberta)
  console.log('\n-> POST /api/donations (público) — criando doação de teste')
  const donationPayload = {
    unitSlug: 'c1',
    category: 'comida',
    quantity: '10 caixas',
    isAnonymous: false,
    donorName: 'Teste Automático',
    donorEmail: 'auto@teste.local',
    date: new Date().toISOString().slice(0, 10), // AAAA-MM-DD
    time: new Date().toISOString().slice(11, 16), // HH:MM
  }

  const createRes = await fetch(base + '/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(donationPayload),
  })

  console.log('Create status:', createRes.status)
  console.log('Create body:', await createRes.text())

  // 4) Verificar doações (autenticado) depois de criar
  console.log('\n-> GET /api/donations (autenticado) — depois')
  const listAfter = await fetch(base + '/api/donations', { headers: { Cookie: cookieValue } })
  console.log('Status:', listAfter.status)
  console.log('Body:', await listAfter.text())
}

main().catch((err) => {
  console.error('Erro no teste de API:', err)
  process.exit(1)
})
