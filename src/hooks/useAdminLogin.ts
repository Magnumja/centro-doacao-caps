import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLocalAuthBypassEnabled } from '../lib/auth'
import { fetchCurrentHost, getLocalDemoHost, loginWithEmail } from '../services/auth-service'

export function useAdminLogin() {
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const localAuthBypassEnabled = isLocalAuthBypassEnabled()

  const persistAndNavigate = (host: unknown) => {
    localStorage.setItem('loggedHost', JSON.stringify(host))
    navigate('/admin/dashboard')
  }

  const fallbackToLocal = () => {
    persistAndNavigate(getLocalDemoHost())
  }

  const directLocalAccess = async () => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      const host = await fetchCurrentHost()
      persistAndNavigate(host)
    } catch (err: any) {
      if (localAuthBypassEnabled) {
        fallbackToLocal()
        return
      }

      setErrorMessage(err?.message || 'Nao foi possivel acessar o painel local.')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setErrorMessage('')
    setIsLoading(true)

    try {
      await loginWithEmail(email, password)
      const host = await fetchCurrentHost()
      persistAndNavigate(host)
    } catch (err: any) {
      if (localAuthBypassEnabled) {
        fallbackToLocal()
        return
      }

      setErrorMessage(err?.message || 'Erro ao autenticar.')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    errorMessage,
    isLoading,
    localAuthBypassEnabled,
    directLocalAccess,
    login,
  }
}
