import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  DonorAccount,
  fetchDonorAccount,
  loginDonor,
  logoutDonor,
  registerDonor,
} from '../services/donor-service'

// Sessão do doador (cookie httpOnly no servidor). O contexto só guarda o perfil para a
// interface saber se há alguém logado; nada sensível fica no navegador.
type DonorSession = {
  donor: DonorAccount | null
  isChecking: boolean
  login: (input: { email: string, password: string }) => Promise<DonorAccount>
  register: (input: { name: string, email: string, password: string }) => Promise<DonorAccount>
  logout: () => Promise<void>
}

const DonorSessionContext = createContext<DonorSession | null>(null)

export function DonorSessionProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [donor, setDonor] = useState<DonorAccount | null>(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    let mounted = true
    // Sem sessão (401), API sem banco (503) ou offline: segue como visitante, sem erro na tela.
    fetchDonorAccount()
      .then((account) => { if (mounted) setDonor(account) })
      .catch(() => { if (mounted) setDonor(null) })
      .finally(() => { if (mounted) setIsChecking(false) })
    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (input: { email: string, password: string }) => {
    const account = await loginDonor(input)
    setDonor(account)
    return account
  }, [])

  const register = useCallback(async (input: { name: string, email: string, password: string }) => {
    const account = await registerDonor(input)
    setDonor(account)
    return account
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutDonor()
    } finally {
      setDonor(null)
    }
  }, [])

  const value = useMemo(() => ({ donor, isChecking, login, register, logout }), [donor, isChecking, login, register, logout])

  return <DonorSessionContext.Provider value={value}>{children}</DonorSessionContext.Provider>
}

export function useDonorSession(): DonorSession {
  const context = useContext(DonorSessionContext)
  if (!context) {
    throw new Error('useDonorSession precisa estar dentro de <DonorSessionProvider>.')
  }
  return context
}
