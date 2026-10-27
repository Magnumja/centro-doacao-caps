import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { isLocalAuthBypassEnabled } from '../lib/auth'
import {
  DonorAccount,
  fetchDonorAccount,
  loginDonor,
  logoutDonor,
  registerDonor,
} from '../services/donor-service'

// Sessão do doador (cookie httpOnly no servidor). O contexto só guarda o perfil para a
// interface saber se há alguém logado; nada sensível fica no navegador.
//
// Modo demonstração (só em localhost, igual ao atalho do painel do gestor): entra sem
// banco nem senha; o histórico vem das doações registradas neste aparelho.
type DonorSession = {
  donor: DonorAccount | null
  isChecking: boolean
  isDemo: boolean
  canUseDemo: boolean
  login: (input: { email: string, password: string }) => Promise<DonorAccount>
  register: (input: { name: string, email: string, password: string }) => Promise<DonorAccount>
  loginDemo: () => void
  logout: () => Promise<void>
}

const DEMO_FLAG_KEY = 'demoDonorSession'
const DEMO_DONOR: DonorAccount = {
  id: 'local-demo-donor',
  name: 'Doador de demonstração',
  email: 'demonstracao@caps.local',
}

function readDemoFlag(): boolean {
  try {
    return isLocalAuthBypassEnabled() && window.localStorage.getItem(DEMO_FLAG_KEY) === '1'
  } catch {
    return false
  }
}

function writeDemoFlag(active: boolean): void {
  try {
    if (active) window.localStorage.setItem(DEMO_FLAG_KEY, '1')
    else window.localStorage.removeItem(DEMO_FLAG_KEY)
  } catch {
    // Sem storage (aba privada): a demonstração vale só enquanto a página estiver aberta.
  }
}

const DonorSessionContext = createContext<DonorSession | null>(null)

export function DonorSessionProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  // Demonstração ativa já começa logada, sem esperar a API (evita a tela "piscar").
  const [isDemo, setIsDemo] = useState(readDemoFlag)
  const [donor, setDonor] = useState<DonorAccount | null>(() => (readDemoFlag() ? DEMO_DONOR : null))
  const [isChecking, setIsChecking] = useState(() => !readDemoFlag())
  const canUseDemo = isLocalAuthBypassEnabled()

  useEffect(() => {
    if (isDemo) return undefined

    let mounted = true
    // Sem sessão (401), API sem banco (503) ou offline: segue como visitante, sem erro na tela.
    fetchDonorAccount()
      .then((account) => { if (mounted) setDonor(account) })
      .catch(() => { if (mounted) setDonor(null) })
      .finally(() => { if (mounted) setIsChecking(false) })
    return () => {
      mounted = false
    }
    // Só na abertura do site; login/logout atualizam o estado diretamente.
  }, [])

  const login = useCallback(async (input: { email: string, password: string }) => {
    const account = await loginDonor(input)
    writeDemoFlag(false)
    setIsDemo(false)
    setDonor(account)
    return account
  }, [])

  const register = useCallback(async (input: { name: string, email: string, password: string }) => {
    const account = await registerDonor(input)
    writeDemoFlag(false)
    setIsDemo(false)
    setDonor(account)
    return account
  }, [])

  const loginDemo = useCallback(() => {
    if (!isLocalAuthBypassEnabled()) return
    writeDemoFlag(true)
    setIsDemo(true)
    setIsChecking(false)
    setDonor(DEMO_DONOR)
  }, [])

  const logout = useCallback(async () => {
    writeDemoFlag(false)
    setIsDemo(false)
    setDonor(null)
    try {
      await logoutDonor()
    } catch {
      // Sem API (ex.: demonstração offline) não há cookie para limpar.
    }
  }, [])

  const value = useMemo(
    () => ({ donor, isChecking, isDemo, canUseDemo, login, register, loginDemo, logout }),
    [donor, isChecking, isDemo, canUseDemo, login, register, loginDemo, logout],
  )

  return <DonorSessionContext.Provider value={value}>{children}</DonorSessionContext.Provider>
}

export function useDonorSession(): DonorSession {
  const context = useContext(DonorSessionContext)
  if (!context) {
    throw new Error('useDonorSession precisa estar dentro de <DonorSessionProvider>.')
  }
  return context
}
