import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { isLocalAuthBypassEnabled } from '../lib/auth'
import { Host } from '../types'

export type NeedCardItem = {
  id: string
  title: string
  amount: number
  description: string
  priority: 'alta' | 'media'
  category: string
  unitId: string
}

export type DashboardDonation = {
  id: string
  category: 'roupa' | 'comida' | 'utensilios'
  quantity: string
  donorName?: string | null
  donorEmail?: string | null
  isAnonymous: boolean
  date: string
  time: string
  registeredAt: string
}

export type DashboardResident = {
  id: string
  name: string
  emergencyContact?: string | null
  entryDate: string
  status: 'ativo' | 'inativo' | 'transferido'
}

type UseDashboardDataResult = {
  loggedHost: (Host & { unitId: string }) | null
  publishedNeeds: NeedCardItem[]
  hostDonations: DashboardDonation[]
  residents: DashboardResident[]
  setPublishedNeeds: Dispatch<SetStateAction<NeedCardItem[]>>
}

const createLocalDemoHost = (): Host & { unitId: string } => ({
  id: 'local-dev-admin',
  name: 'Administrador local',
  email: 'local@localhost',
  password: '',
  capId: 'c1',
  contact: '',
  role: 'admin',
  unitId: 'local-unit-c1',
})

export function useDashboardData(): UseDashboardDataResult {
  const [loggedHost, setLoggedHost] = useState<(Host & { unitId: string }) | null>(null)
  const [publishedNeeds, setPublishedNeeds] = useState<NeedCardItem[]>([])
  const [hostDonations, setHostDonations] = useState<DashboardDonation[]>([])
  const [residents, setResidents] = useState<DashboardResident[]>([])
  const navigate = useNavigate()
  const localAuthBypassEnabled = isLocalAuthBypassEnabled()

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const host = (await api.get('/api/auth/me')) as Host & { unitId: string }
        if (!mounted) return

        localStorage.setItem('loggedHost', JSON.stringify(host))
        setLoggedHost(host)

        try {
          const [allNeeds, donationsResponse, residentsResponse] = await Promise.all([
            api.get('/api/needs'),
            api.get<{ data: DashboardDonation[] }>('/api/donations'),
            api.get<DashboardResident[]>('/api/residents'),
          ])

          if (!mounted) return

          const normalizedNeeds: NeedCardItem[] = (Array.isArray(allNeeds) ? allNeeds : [])
            .filter((need: any) => (need.unitId ?? need.unit?.id) === host.unitId)
            .map((need: any) => ({
              id: need.id,
              title: need.title,
              amount: need.amount,
              description: need.description,
              priority: need.priority,
              category: need.category,
              unitId: need.unitId ?? need.unit?.id ?? host.unitId,
            }))

          setPublishedNeeds(normalizedNeeds)
          setHostDonations(Array.isArray(donationsResponse?.data) ? donationsResponse.data : [])
          setResidents(Array.isArray(residentsResponse) ? residentsResponse : [])
        } catch {
          if (localAuthBypassEnabled && mounted) {
            setPublishedNeeds([])
            setHostDonations([])
            setResidents([])
          }
        }
      } catch {
        if (localAuthBypassEnabled && mounted) {
          const demoHost = createLocalDemoHost()
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
