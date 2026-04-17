import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLocalAuthBypassEnabled } from '../lib/auth'
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

        localStorage.setItem('loggedHost', JSON.stringify(host))
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
        if (localAuthBypassEnabled && mounted) {
          const demoHost = getLocalDemoHost()
          localStorage.setItem('loggedHost', JSON.stringify(demoHost))
          setLoggedHost(demoHost)
          setPublishedNeeds([])
          setHostDonations([])
          setResidents([])
          return
        }

        localStorage.removeItem('loggedHost')
        if (mounted) {
          navigate('/admin/login')
        }
      }
    })()

    return () => {
      mounted = false
    }
  }, [localAuthBypassEnabled, navigate])

  return { loggedHost, publishedNeeds, hostDonations, residents, setPublishedNeeds }
}
