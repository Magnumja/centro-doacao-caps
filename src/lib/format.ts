// Datas "YYYY-MM-DD" vindas de <input type="date"> ou da API são datas de calendário,
// sem fuso. `new Date('2026-10-27')` as interpreta como UTC e, em Campo Grande (UTC-4),
// mostraria o dia anterior. Por isso todas as datas passam por aqui.

function parseCalendarDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

// "2026-10-27" -> "27/10/2026"
export function formatDate(value?: string | null, fallback = 'Data não informada'): string {
  if (!value) return fallback
  const date = parseCalendarDate(value)
  return date ? date.toLocaleDateString('pt-BR') : value
}

// Data de hoje no fuso do usuário, no formato aceito por <input type="date" min>.
export function todayISODate(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
