import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = {
  pink: [240, 98, 146],
  pinkLight: [248, 187, 208],
  gold: [240, 98, 146],
  goldLight: [253, 235, 244],
  gray: [107, 114, 128],
  darkGray: [31, 41, 55],
  white: [255, 255, 255],
  border: [243, 220, 232],
}

function parseTva(str) {
  return parseFloat(str.replace(',', '.').replace('%', '').trim()) / 100
}

function formatEur(n) {
  const parts = n.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return parts.join(',') + ' \u20AC'
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function loadImageAsBase64(url) {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function getNextInvoiceNumber() {
  const year = new Date().getFullYear()
  const key = `instantmariage_invoice_counter_${year}`
  const current = parseInt(localStorage.getItem(key) || '0', 10)
  return `FAC-${year}-${String(current + 1).padStart(3, '0')}`
}

function confirmInvoiceNumber(num) {
  const match = num.match(/^FAC-(\d{4})-(\d+)$/)
  if (!match) return
  const key = `instantmariage_invoice_counter_${match[1]}`
  const seq = parseInt(match[2], 10)
  const current = parseInt(localStorage.getItem(key) || '0', 10)
  if (seq > current) localStorage.setItem(key, String(seq))
}

export async function generateInvoicePDF(data, options = {}) {
  const {
    prestataire, client, evenement, prestations,
    specificValues, tva, conditions, provider,
  } = data

  const today = new Date().toISOString().slice(0, 10)
  const defaultEcheance = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)

  const {
    numeroFacture = getNextInvoiceNumber(),
    dateEcheance = defaultEcheance,
    marquePayee = false,
  } = options

  const logoBase64 = await loadImageAsBase64('/1024px - Other Use.png')
  const doc = new jsPDF({ unit: 'mm', format: 'a4', putOnlyUsedFonts: true })
  const W = 210
  let y = 0

  const fill = (c) => doc.setFillColor(...c)
  const stroke = (c) => doc.setDrawColor(...c)
  const textColor = (c) => doc.setTextColor(...c)
  const font = (style = 'normal', size = 10) => {
    doc.setFont('helvetica', style)
    doc.setFontSize(size)
  }
  const rect = (x, xw, yy, h, color) => {
    fill(color)
    doc.rect(x, yy, xw, h, 'F')
  }
  const drawFooterOnPage = () => {
    rect(0, W, 285, 12, COLORS.pink)
    textColor([255, 255, 255])
    font('normal', 7.5)
    doc.text(
      `${prestataire.entreprise || prestataire.nom} • ${prestataire.email} • ${prestataire.telephone}`,
      W / 2, 292, { align: 'center' }
    )
  }

  // ── HEADER ────────────────────────────────────────────────────────────
  rect(0, W, 0, 45, COLORS.pink)

  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.3)
  for (let i = 0; i < 8; i++) {
    doc.circle(W - 15 + i * 3, 10 + i * 4, 8, 'S')
  }

  doc.addImage(logoBase64, 'PNG', 12, 8, 21, 21)

  textColor([255, 255, 255])
  font('bold', 20)
  doc.text('FACTURE', 37, 19)
  font('normal', 11)
  doc.text(provider.name.toUpperCase(), 37, 29)

  font('normal', 9)
  textColor([255, 220, 240])
  doc.text(`N° ${numeroFacture}`, W - 15, 20, { align: 'right' })
  doc.text(`Émis le ${formatDate(today)}`, W - 15, 27, { align: 'right' })
  doc.text(`Échéance : ${formatDate(dateEcheance)}`, W - 15, 34, { align: 'right' })

  y = 52

  // ── PRESTATAIRE + CLIENT ──────────────────────────────────────────────
  const colW = 85
  const gap = 10
  const col2x = 15 + colW + gap

  rect(15, colW, y, 52, [253, 242, 248])
  stroke(COLORS.border)
  doc.setLineWidth(0.5)
  doc.rect(15, y, colW, 52, 'S')

  textColor(COLORS.pink)
  font('bold', 8)
  doc.text('ÉMETTEUR', 20, y + 7)

  textColor(COLORS.darkGray)
  font('bold', 11)
  const nomPre = [prestataire.entreprise, `${prestataire.prenom} ${prestataire.nom}`]
    .filter(Boolean).join(' – ')
  const nomLines = doc.splitTextToSize(nomPre, colW - 10)
  doc.text(nomLines, 20, y + 14)

  font('normal', 8.5)
  textColor(COLORS.gray)
  let yp = y + 14 + nomLines.length * 5
  const preLines = [
    prestataire.adresse,
    `${prestataire.codePostal} ${prestataire.ville}`.trim(),
    prestataire.telephone,
    prestataire.email,
    prestataire.siteWeb,
    prestataire.siret ? `SIRET : ${prestataire.siret}` : '',
  ].filter(Boolean)
  preLines.forEach(l => { doc.text(l, 20, yp); yp += 5 })

  rect(col2x, colW, y, 52, [253, 235, 244])
  stroke(COLORS.border)
  doc.rect(col2x, y, colW, 52, 'S')

  textColor(COLORS.gold)
  font('bold', 8)
  doc.text('FACTURÉ À', col2x + 5, y + 7)

  textColor(COLORS.darkGray)
  font('bold', 11)
  doc.text(`${client.prenom} ${client.nom}`.trim(), col2x + 5, y + 14)

  font('normal', 8.5)
  textColor(COLORS.gray)
  let yc = y + 20
  ;[client.adresse, client.telephone, client.email].filter(Boolean).forEach(l => {
    doc.text(l, col2x + 5, yc)
    yc += 5
  })

  y += 58

  // ── PRESTATION ────────────────────────────────────────────────────────
  rect(15, W - 30, y, 20, COLORS.goldLight)
  stroke(COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(15, y, W - 30, 20, 'S')

  textColor(COLORS.gold)
  font('bold', 8)
  doc.text('PRESTATION', 20, y + 7)

  textColor(COLORS.darkGray)
  font('normal', 9)
  const evInfo = [
    evenement.dateMariage ? `Date : ${formatDate(evenement.dateMariage)}` : '',
    evenement.lieu ? `Lieu : ${evenement.lieu}` : '',
    evenement.ville ? `Ville : ${evenement.ville}` : '',
    evenement.nbInvites ? `Invités : ${evenement.nbInvites}` : '',
  ].filter(Boolean).join('    |    ')
  doc.text(evInfo, 20, y + 14)

  y += 26

  // ── TABLEAU PRESTATIONS ───────────────────────────────────────────────
  const tvaRate = parseTva(tva)
  const rows = prestations.map(p => [p.label, p.qty, formatEur(p.price), formatEur(p.price * p.qty)])

  const totalHT = prestations.reduce((s, p) => s + p.price * p.qty, 0)
  const montantTVA = totalHT * tvaRate
  const totalTTC = totalHT + montantTVA

  autoTable(doc, {
    startY: y,
    head: [['DÉSIGNATION', 'QTÉ', 'PRIX UNIT.', 'TOTAL HT']],
    body: rows,
    margin: { left: 15, right: 15 },
    styles: { fontSize: 9, cellPadding: 4, textColor: COLORS.darkGray, lineColor: COLORS.border, lineWidth: 0.3 },
    headStyles: { fillColor: COLORS.pink, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: [253, 242, 248] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
    },
  })

  y = doc.lastAutoTable.finalY + 6

  // ── TOTAUX ────────────────────────────────────────────────────────────
  const totW = 80
  const totX = W - 15 - totW

  const drawTotalLine = (label, value, bold = false, highlight = false) => {
    if (highlight) {
      rect(totX - 5, totW + 5, y - 4, 10, COLORS.pink)
      textColor([255, 255, 255])
    } else {
      textColor(COLORS.gray)
    }
    font(bold ? 'bold' : 'normal', bold ? 10 : 9)
    doc.text(label, totX, y + 3)
    if (!highlight) textColor(COLORS.darkGray)
    doc.text(formatEur(value), totX + totW, y + 3, { align: 'right' })
    y += 9
  }

  drawTotalLine('Total HT', totalHT)
  drawTotalLine(`TVA (${tva})`, montantTVA)
  y += 2
  stroke(COLORS.pink)
  doc.setLineWidth(0.5)
  doc.line(totX - 5, y - 2, totX + totW, y - 2)
  drawTotalLine('TOTAL TTC', totalTTC, true, true)

  // ── MODALITÉS DE PAIEMENT ─────────────────────────────────────────────
  y += 8
  if (y > 240) { doc.addPage(); y = 20 }

  rect(15, W - 30, y, 7, COLORS.goldLight)
  textColor(COLORS.gold)
  font('bold', 8)
  doc.text('MODALITÉS DE PAIEMENT', 20, y + 5)
  y += 11

  font('normal', 8.5)
  textColor(COLORS.gray)
  doc.text(`Date d'échéance : ${formatDate(dateEcheance)}`, 15, y)
  y += 6
  const condText = conditions || 'Paiement à réception de la présente facture.'
  const condLines = doc.splitTextToSize(condText, W - 30)
  doc.text(condLines, 15, y)
  y += condLines.length * 4.5 + 6

  // ── CHAMPS SPÉCIFIQUES ────────────────────────────────────────────────
  const specEntries = Object.entries(specificValues || {}).filter(([, v]) => v)
  if (specEntries.length > 0) {
    if (y > 240) { doc.addPage(); y = 20 }
    const fieldDefs = provider.specificFields || []
    rect(15, W - 30, y, 7, COLORS.pinkLight)
    textColor(COLORS.pink)
    font('bold', 8)
    doc.text('INFORMATIONS SPÉCIFIQUES', 20, y + 5)
    y += 10
    font('normal', 8.5)
    specEntries.forEach(([id, val]) => {
      const def = fieldDefs.find(f => f.id === id)
      textColor(COLORS.gray)
      doc.text(`${def ? def.label : id} :`, 20, y)
      textColor(COLORS.darkGray)
      doc.text(String(val), 80, y)
      y += 6
    })
  }

  // ── SIGNATURE ─────────────────────────────────────────────────────────
  if (y > 250) { doc.addPage(); y = 20 } else { y += 6 }

  rect(15, W - 30, y, 32, [249, 249, 252])
  stroke(COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(15, y, W - 30, 32, 'S')

  const sigW = (W - 40) / 2
  textColor(COLORS.gray)
  font('normal', 7.5)
  doc.text('Bon pour paiement – Signature du client :', 20, y + 7)
  doc.setLineDash([2, 2])
  stroke([200, 200, 200])
  doc.line(20, y + 24, 20 + sigW - 10, y + 24)
  doc.text('Date et signature précédées de « Bon pour paiement »', 20, y + 29)

  const sig2x = 20 + sigW + 5
  doc.text('Signature du prestataire :', sig2x, y + 7)
  doc.line(sig2x, y + 24, sig2x + sigW - 10, y + 24)
  doc.setLineDash([])

  // ── FOOTER SUR TOUTES LES PAGES ───────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    drawFooterOnPage()
    textColor([255, 200, 230])
    font('normal', 7)
    doc.text(`Page ${i} / ${pageCount}`, W - 15, 292, { align: 'right' })
  }

  // ── TAMPON ACQUITTÉ ───────────────────────────────────────────────────
  if (marquePayee) {
    doc.setPage(1)
    try { doc.setGState(doc.GState({ opacity: 0.38 })) } catch (_) { /* noop */ }
    textColor([22, 163, 74])
    font('bold', 52)
    doc.text('ACQUITTÉ', W / 2 + 15, 160, { align: 'center', angle: 30 })
    try { doc.setGState(doc.GState({ opacity: 1 })) } catch (_) { /* noop */ }
  }

  const fileName = `Facture_${provider.name}_${client.nom || 'Client'}_${evenement.dateMariage || 'date'}.pdf`
    .replace(/\s+/g, '_')
  doc.save(fileName)

  confirmInvoiceNumber(numeroFacture)
}
