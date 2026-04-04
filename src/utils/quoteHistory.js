const STORAGE_KEY = 'instantmariage_quotes_history'

function parseTva(str) {
  return parseFloat(str.replace(',', '.').replace('%', '').trim()) / 100
}

export function computeTotalTTC(formData) {
  const { prestations, tva, acompte } = formData
  const tvaRate = parseTva(tva)
  const totalHT = prestations.reduce((s, p) => s + p.price * p.qty, 0)
  const totalTTC = totalHT + totalHT * tvaRate
  const montantAcompte = totalTTC * (parseFloat(acompte) / 100)
  return { totalHT, totalTTC, montantAcompte }
}

export function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveQuote(formData) {
  const { client, provider, numeroDevis, evenement } = formData
  const { totalTTC } = computeTotalTTC(formData)

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    savedAt: new Date().toISOString(),
    numeroDevis,
    clientName: `${client.prenom} ${client.nom}`.trim(),
    providerName: provider.name,
    providerEmoji: provider.emoji,
    dateMariage: evenement.dateMariage || null,
    totalTTC,
    formData,
  }

  const history = loadHistory()
  // Dédoublonnage sur le numéro de devis
  const filtered = history.filter(q => q.numeroDevis !== numeroDevis)
  const updated = [entry, ...filtered]
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage plein : on retire le plus ancien
    const trimmed = [entry, ...filtered.slice(0, filtered.length - 1)]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  }
  return entry
}

export function deleteQuote(id) {
  const history = loadHistory().filter(q => q.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  return history
}
