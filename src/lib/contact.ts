import { Cap } from '../types'

function onlyDigits(value?: string): string {
  return (value ?? '').replace(/\D/g, '')
}

export function getPhoneDigits(unit: Cap): string | undefined {
  const digits = onlyDigits(unit.whatsapp ?? unit.contact)
  if (digits.length < 10) return undefined
  return digits.startsWith('55') ? digits : `55${digits}`
}

export function getWhatsAppUrl(unit: Cap): string | undefined {
  const digits = getPhoneDigits(unit)
  return digits ? `https://wa.me/${digits}` : undefined
}

export function getMapsUrl(address?: string): string | undefined {
  if (!address) return undefined
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}
