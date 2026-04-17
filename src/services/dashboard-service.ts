import api from '../lib/api'
import { DashboardDonation, DashboardResident, NeedCardItem } from '../types/dashboard'

export async function fetchDashboardCollections(unitId: string): Promise<{
  needs: NeedCardItem[]
  donations: DashboardDonation[]
  residents: DashboardResident[]
}> {
  const [allNeeds, donationsResponse, residentsResponse] = await Promise.all([
    api.get<any[]>('/api/needs'),
    api.get<{ data: DashboardDonation[] }>('/api/donations'),
    api.get<DashboardResident[]>('/api/residents'),
  ])

  const normalizedNeeds: NeedCardItem[] = (Array.isArray(allNeeds) ? allNeeds : [])
    .filter((need: any) => (need.unitId ?? need.unit?.id) === unitId)
    .map((need: any) => ({
      id: need.id,
      title: need.title,
      amount: need.amount,
      description: need.description,
      priority: need.priority,
      category: need.category,
      unitId: need.unitId ?? need.unit?.id ?? unitId,
    }))

  return {
    needs: normalizedNeeds,
    donations: Array.isArray(donationsResponse?.data) ? donationsResponse.data : [],
    residents: Array.isArray(residentsResponse) ? residentsResponse : [],
  }
}
