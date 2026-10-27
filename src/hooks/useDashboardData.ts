import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLocalAuthBypassEnabled } from '../lib/auth'
import { clearHostSession, hasStoredDemoSession, storeHostSession } from '../lib/session'
import { fetchCurrentHost, getLocalDemoHost } from '../services/auth-service'
import { fetchDashboardCollections } from '../services/dashboard-service'
import { DashboardDonation, DashboardHost, DashboardResident, NeedCardItem } from '../types/dashboard'

type UseDashboardDataResult = {
  loggedHost: DashboardHost | null
  publishedNeeds: NeedCardItem[]
  hostDonations: DashboardDonation[]
  residents: DashboardResident[]
  setPublishedNeeds: Dispatch<SetStateAction<NeedCardItem[]>>
}

export function useDashboardData(): UseDashboardDataResult {
  const [loggedHost, setLoggedHost] = useState<DashboardHost | null>(null)
  const [publishedNeeds, setPublishedNeeds] = useState<NeedCardItem[]>([])
  const [hostDonations, setHostDonations] = useState<DashboardDonation[]>([])
  const [residents, setResidents] = useState<DashboardResident[]>([])
  const navigate = useNavigate()
  const localAuthBypassEnabled = isLocalAuthBypassEnabled()

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const host = await fetchCurrentHost()
        if (!mounted) return

        storeHostSession(host)
        setLoggedHost(host)

        try {
          const data = await fetchDashboardCollections(host.unitId)
          if (!mounted) return

          setPublishedNeeds(data.needs)
          setHostDonations(data.donations)
          setResidents(data.residents)
        } catch {
          if (localAuthBypassEnabled && mounted) {
            setPublishedNeeds([])
            setHostDonations([])
            setResidents([])
          }
        }
      } catch {
        // Execução já descartada (ex.: StrictMode monta/desmonta, ou a pessoa saiu da
        // página): não pode mexer na sessão, senão apaga a da execução seguinte.
        if (!mounted) return

        // Sem sessão válida no servidor: só segue em modo demonstração se a pessoa
        // escolheu esse acesso no login (localhost). Caso contrário, volta ao login.
        if (localAuthBypassEnabled && hasStoredDemoSession()) {
          const demoHost = getLocalDemoHost()
          storeHostSession(demoHost)
          setLoggedHost(demoHost)
          setPublishedNeeds([])
          setHostDonations([])
          setResidents([])
          return
        }

        clearHostSession()
        navigate('/admin/login')
      }
    })()

    return () => {
      mounted = false
    }
  }, [localAuthBypassEnabled, navigate])

  return { loggedHost, publishedNeeds, hostDonations, residents, setPublishedNeeds }
}
