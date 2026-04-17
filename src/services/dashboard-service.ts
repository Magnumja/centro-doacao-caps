import api from '../lib/api'
import { DashboardDonation, DashboardResident, NeedCardItem } from '../types/dashboard'

type DashboardNeedResponseItem = {
  id: NeedCardItem['id']
  title: NeedCardItem['title']
  amount: NeedCardItem['amount']
  description: NeedCardItem['description']
  priority: NeedCardItem['priority']
  category: NeedCardItem['category']
  unitId?: NeedCardItem['unitId']
  unit?: {
    id?: NeedCardItem['unitId']
  }
}

export async function fetchDashboardCollections(unitId: string): Promise<{
  needs: NeedCardItem[]
  donations: DashboardDonation[]
  residents: DashboardResident[]
}> {
  const [allNeeds, donationsResponse, residentsResponse] = await Promise.all([
    api.get<DashboardNeedResponseItem[]>(`/api/needs?unitId=${encodeURIComponent(unitId)}`),
    api.get<{ data: DashboardDonation[] }>('/api/donations'),
    api.get<DashboardResident[]>('/api/residents'),
  ])

  const normalizedNeeds: NeedCardItem[] = (Array.isArray(allNeeds) ? allNeeds : []).map((need: DashboardNeedResponseItem) => ({
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
