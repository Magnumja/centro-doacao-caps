import { useEffect, useState } from 'react'

import { fetchPublicNeeds } from '../lib/needs'
import { fetchPublicUnits } from '../services/units-service'
import { Cap, Need } from '../types'

// Cache em memória compartilhado entre páginas: ao navegar Home -> CAPS -> Necessidades
// os dados aparecem na hora (sem "piscar" vazio) e são revalidados em segundo plano.
type Resource<T> = {
  value?: T
  inFlight?: Promise<T>
  loader: () => Promise<T>
  listeners: Set<(value: T) => void>
}

function createResource<T>(loader: () => Promise<T>): Resource<T> {
  return { loader, listeners: new Set() }
}

function refresh<T>(resource: Resource<T>): Promise<T> {
  if (!resource.inFlight) {
    resource.inFlight = resource.loader()
      .then((value) => {
        resource.value = value
        resource.listeners.forEach((listener) => listener(value))
        return value
      })
      .finally(() => {
        resource.inFlight = undefined
      })
  }

  return resource.inFlight
}

function useResource<T>(resource: Resource<T>, placeholder: T): { data: T, isLoading: boolean } {
  const [data, setData] = useState<T | undefined>(resource.value)

  useEffect(() => {
    resource.listeners.add(setData)
    void refresh(resource)
    return () => {
      resource.listeners.delete(setData)
    }
  }, [resource])

  return { data: data ?? placeholder, isLoading: data === undefined }
}

const unitsResource = createResource<Cap[]>(fetchPublicUnits)
const needsResource = createResource<Need[]>(fetchPublicNeeds)
const EMPTY_UNITS: Cap[] = []
const EMPTY_NEEDS: Need[] = []

export function useUnits(): { units: Cap[], isLoading: boolean } {
  const { data, isLoading } = useResource(unitsResource, EMPTY_UNITS)
  return { units: data, isLoading }
}

export function useNeeds(): { needs: Need[], isLoading: boolean } {
  const { data, isLoading } = useResource(needsResource, EMPTY_NEEDS)
  return { needs: data, isLoading }
}

// Chame após publicar/apagar pedidos para que todas as telas vejam a mudança.
export function invalidatePublicNeeds(): void {
  void refresh(needsResource)
}

