import api from '../lib/api'
import { HighlightItem, highlights as localHighlights } from '../data/highlights'

const capsImages = [
  '/capsmargarida.jpg',
  '/capsafrodite.jpeg',
  '/capsaerorancho.jpeg',
  '/capsvilaalmeida.jpeg',
  '/capsdrafatima.jpg',
  '/capsmarciazen.jpg',
]

function isCapsImage(image: string): boolean {
  return capsImages.some((img) => image === img || image.endsWith(img))
}

function sanitizeHighlights(items: HighlightItem[]): HighlightItem[] {
  return items.map((item, index) => ({
    ...item,
    image: isCapsImage(item.image) ? item.image : capsImages[index % capsImages.length],
  }))
}

export async function fetchHighlights(): Promise<HighlightItem[]> {
  try {
    const response = await api.get<HighlightItem[]>('/api/highlights')
    if (Array.isArray(response) && response.length > 0) {
      return sanitizeHighlights(response)
    }
    return localHighlights
  } catch {
    return localHighlights
  }
}
