import jsPDF from 'jspdf'

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

export async function generateContractPDF(data) {
  const {
    prestataire, client, evenement, prestations,
    tva, acompte, numeroDevis, provider,
  } = data

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

  const MAX_Y = 278 // footer starts at 285

  function checkPageBreak(needed = 12) {
    if (y + needed > MAX_Y) {
      doc.addPage()
      y = 15
      // Mini-header on continuation pages
      textColor(COLORS.pink)
      font('bold', 7)
      doc.text(
        `CONTRAT DE PRESTATION — ${(prestataire.entreprise || prestataire.nom).toUpperCase()} / ${client.prenom} ${client.nom}`,
        15, y
      )
      stroke(COLORS.pinkLight)
      doc.setLineWidth(0.4)
      doc.line(15, y + 3, W - 15, y + 3)
      y += 9
      return true
    }
    return false
  }

  function addSectionTitle(title) {
    checkPageBreak(18)
    y += 3
    rect(15, W - 30, y, 8, COLORS.pinkLight)
    textColor(COLORS.pink)
    font('bold', 8.5)
    doc.text(title, 20, y + 5.5)
    y += 12
  }

  function addParagraph(text, opts = {}) {
    const { size = 8.5, color = COLORS.gray, indent = 15, lineH = 4.8 } = opts
    font('normal', size)
    textColor(color)
    const lines = doc.splitTextToSize(text, W - indent - 15)
    checkPageBreak(lines.length * lineH + 3)
    doc.text(lines, indent, y)
    y += lines.length * lineH + 3
  }

  function addBoldLabel(label, value) {
    font('bold', 8.5)
    textColor(COLORS.darkGray)
    doc.text(label, 20, y)
    font('normal', 8.5)
    textColor(COLORS.gray)
    const valLines = doc.splitTextToSize(value, W - 65)
    doc.text(valLines, 55, y)
    y += Math.max(1, valLines.length) * 5
  }

  // ── CALCULS ───────────────────────────────────────────────────────────
  const tvaRate = parseTva(tva)
  const totalHT = prestations.reduce((s, p) => s + p.price * p.qty, 0)
  const montantTVA = totalHT * tvaRate
  const totalTTC = totalHT + montantTVA
  const acompteRate = parseFloat(acompte) / 100
  const montantAcompte = totalTTC * acompteRate
  const solde = totalTTC - montantAcompte
  const numeroContrat = numeroDevis.replace(/^DEV-/, 'CTR-')
  const today = new Date().toISOString().slice(0, 10)

  // ── HEADER ────────────────────────────────────────────────────────────
  rect(0, W, 0, 50, COLORS.pink)

  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.3)
  for (let i = 0; i < 8; i++) {
    doc.circle(W - 15 + i * 3, 10 + i * 4, 8, 'S')
  }

  doc.addImage(logoBase64, 'PNG', 12, 8, 21, 21)

  textColor([255, 255, 255])
  font('bold', 14)
  doc.text('CONTRAT DE PRESTATION', 37, 18)
  font('normal', 10)
  doc.text('DE SERVICES — MARIAGE', 37, 26)

  font('normal', 8.5)
  textColor([255, 220, 240])
  doc.text(`N° ${numeroContrat}`, W - 15, 20, { align: 'right' })
  doc.text(`Établi le ${formatDate(today)}`, W - 15, 27, { align: 'right' })
  doc.text(`Réf. devis : ${numeroDevis}`, W - 15, 34, { align: 'right' })

  // Bandeau "Entre les soussignés"
  rect(0, W, 50, 10, [216, 27, 96])
  textColor([255, 255, 255])
  font('bold', 9)
  doc.text('ENTRE LES SOUSSIGNÉS', W / 2, 56.5, { align: 'center' })

  y = 68

  // ── ARTICLE 1 — LES PARTIES ───────────────────────────────────────────
  addSectionTitle('ARTICLE 1 — LES PARTIES')

  // Prestataire
  rect(15, W - 30, y, 6, [253, 242, 248])
  textColor(COLORS.pink)
  font('bold', 8)
  doc.text('LE PRESTATAIRE', 20, y + 4.3)
  y += 9

  const nomPre = [prestataire.entreprise, `${prestataire.prenom} ${prestataire.nom}`]
    .filter(Boolean).join(' – ')
  addBoldLabel('Dénomination :', nomPre)
  if (prestataire.siret) addBoldLabel('SIRET :', prestataire.siret)
  if (prestataire.adresse) addBoldLabel('Adresse :', `${prestataire.adresse}, ${prestataire.codePostal} ${prestataire.ville}`.trim())
  if (prestataire.telephone) addBoldLabel('Téléphone :', prestataire.telephone)
  if (prestataire.email) addBoldLabel('Email :', prestataire.email)
  y += 3

  // Client
  rect(15, W - 30, y, 6, [253, 235, 244])
  textColor(COLORS.gold)
  font('bold', 8)
  doc.text('LE CLIENT', 20, y + 4.3)
  y += 9

  addBoldLabel('Nom :', `${client.prenom} ${client.nom}`.trim())
  if (client.adresse) addBoldLabel('Adresse :', client.adresse)
  if (client.telephone) addBoldLabel('Téléphone :', client.telephone)
  if (client.email) addBoldLabel('Email :', client.email)
  y += 3

  addParagraph(
    'Ci-après désignés ensemble « les Parties » et individuellement « la Partie ».',
    { color: COLORS.gray, size: 8 }
  )

  // ── ARTICLE 2 — OBJET ─────────────────────────────────────────────────
  addSectionTitle('ARTICLE 2 — OBJET DU CONTRAT')

  addParagraph(
    `Le PRESTATAIRE s'engage à réaliser la prestation de ${provider.name.toLowerCase()} suivante pour le mariage du CLIENT :`,
    { color: COLORS.darkGray }
  )
  y += 1
  prestations.forEach(p => {
    addParagraph(
      `• ${p.label}${p.qty > 1 ? ` (×${p.qty})` : ''} — ${formatEur(p.price * p.qty)} HT`,
      { indent: 20, color: COLORS.gray }
    )
  })
  y += 2

  // ── ARTICLE 3 — DATE ET LIEU ──────────────────────────────────────────
  addSectionTitle('ARTICLE 3 — DATE ET LIEU DE LA PRESTATION')

  rect(15, W - 30, y, 22, COLORS.goldLight)
  stroke(COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(15, y, W - 30, 22, 'S')

  font('normal', 8.5)
  textColor(COLORS.darkGray)
  const evDetails = [
    evenement.dateMariage ? `Date : ${formatDate(evenement.dateMariage)}` : null,
    evenement.lieu ? `Lieu : ${evenement.lieu}` : null,
    evenement.adresseLieu ? `Adresse : ${evenement.adresseLieu}` : null,
    evenement.ville ? `Ville : ${evenement.ville}` : null,
    evenement.nbInvites ? `Nombre d'invités : ${evenement.nbInvites}` : null,
  ].filter(Boolean)

  const col1 = evDetails.slice(0, Math.ceil(evDetails.length / 2))
  const col2 = evDetails.slice(Math.ceil(evDetails.length / 2))
  col1.forEach((line, i) => { doc.text(line, 20, y + 6 + i * 5) })
  col2.forEach((line, i) => { doc.text(line, W / 2, y + 6 + i * 5) })
  y += 26

  // ── ARTICLE 4 — MONTANT ET PAIEMENT ───────────────────────────────────
  addSectionTitle('ARTICLE 4 — MONTANT ET MODALITÉS DE PAIEMENT')

  addBoldLabel('Total HT :', formatEur(totalHT))
  addBoldLabel(`TVA (${tva}) :`, formatEur(montantTVA))
  addBoldLabel('Total TTC :', formatEur(totalTTC))
  if (acompteRate > 0) {
    y += 1
    addBoldLabel(`Acompte à la signature (${acompte} %) :`, `${formatEur(montantAcompte)} — dû à la signature du présent contrat`)
    addBoldLabel('Solde restant :', `${formatEur(solde)} — dû avant ou le jour de la prestation`)
  } else {
    y += 1
    addBoldLabel('Modalité :', 'Paiement intégral dû avant ou le jour de la prestation.')
  }
  y += 2
  addParagraph(
    "Les modes de paiement acceptés sont précisés par le PRESTATAIRE (virement bancaire, chèque, espèces dans la limite légale). Tout retard de paiement entraîne l\u2019application de pénalités au taux légal en vigueur.",
    { size: 8 }
  )

  // ── ARTICLE 5 — CONDITIONS D'ANNULATION ───────────────────────────────
  addSectionTitle("ARTICLE 5 — CONDITIONS D'ANNULATION")

  addParagraph("En cas d'annulation par le CLIENT, les conditions suivantes s'appliquent :", { color: COLORS.darkGray, size: 8.5 })
  addParagraph("• Plus de 6 mois avant la date de la prestation : seul l'acompte versé reste acquis au PRESTATAIRE à titre d'indemnisation.", { indent: 20 })
  addParagraph("• Entre 3 et 6 mois avant la date de la prestation : 50 % du montant total TTC sera dû au PRESTATAIRE.", { indent: 20 })
  addParagraph("• Moins de 3 mois avant la date de la prestation : la totalité du montant total TTC sera due au PRESTATAIRE.", { indent: 20 })
  y += 1
  addParagraph(
    "En cas d'annulation à l'initiative du PRESTATAIRE, l'intégralité des sommes versées sera remboursée au CLIENT dans un délai de 30 jours, et le PRESTATAIRE s'engagera à orienter le CLIENT vers un prestataire de remplacement dans la mesure du possible."
  )

  // ── ARTICLE 6 — FORCE MAJEURE ─────────────────────────────────────────
  addSectionTitle('ARTICLE 6 — FORCE MAJEURE')

  addParagraph(
    "Aucune des parties ne saurait être tenue responsable de l'inexécution de ses obligations contractuelles lorsque celle-ci résulte d'un cas de force majeure au sens de l'article 1218 du Code civil, soit un événement imprévisible, irrésistible et extérieur aux parties (catastrophe naturelle, épidémie officiellement déclarée, interdiction administrative, conflit armé, grève générale des transports, etc.)."
  )
  addParagraph(
    "La partie concernée devra notifier l'autre sans délai. Les parties s'engagent à rechercher de bonne foi toute solution amiable adaptée à la situation, notamment un report de la prestation à une date ultérieure."
  )

  // ── ARTICLE 7 — DROITS À L'IMAGE ─────────────────────────────────────
  addSectionTitle("ARTICLE 7 — DROITS À L'IMAGE")

  addParagraph(
    "Sauf refus exprès notifié par écrit au PRESTATAIRE avant la date de la prestation, le CLIENT autorise le PRESTATAIRE à utiliser les photographies, vidéos et enregistrements réalisés dans le cadre de la présente prestation à des fins de promotion de son activité professionnelle (site internet, réseaux sociaux, portfolio, publications professionnelles)."
  )
  addParagraph(
    "Cette autorisation est consentie à titre gratuit, sans limitation géographique ni limitation de durée. Les données personnelles traitées dans le cadre de ce contrat le sont conformément au Règlement (UE) 2016/679 relatif à la protection des données personnelles (RGPD)."
  )

  // ── ARTICLE 8 — RESPONSABILITÉ ────────────────────────────────────────
  addSectionTitle('ARTICLE 8 — RESPONSABILITÉ')

  addParagraph(
    "Le PRESTATAIRE met en œuvre tous les moyens raisonnables et professionnels nécessaires à la bonne exécution de la prestation. Sa responsabilité, en cas de manquement avéré, est limitée au montant des sommes effectivement perçues au titre du présent contrat."
  )
  addParagraph(
    "Le PRESTATAIRE ne peut être tenu responsable des dommages indirects ou immatériels, ni des préjudices consécutifs à des circonstances indépendantes de sa volonté. Toute réclamation doit être formulée par écrit dans les 30 jours suivant la réalisation de la prestation."
  )

  // ── ARTICLE 9 — DROIT APPLICABLE ET LITIGES ──────────────────────────
  addSectionTitle('ARTICLE 9 — DROIT APPLICABLE ET RÈGLEMENT DES LITIGES')

  addParagraph(
    "Le présent contrat est soumis au droit français. En cas de différend, les parties s'engagent à rechercher une solution amiable avant toute action en justice. À défaut d'accord dans un délai de 30 jours à compter de la notification du litige, celui-ci sera soumis à la compétence exclusive des tribunaux du ressort du siège social du PRESTATAIRE."
  )

  // ── SIGNATURES ────────────────────────────────────────────────────────
  checkPageBreak(55)
  y += 4

  addParagraph(
    `Fait à ${evenement.ville || '________________'}, le ${formatDate(today)}, en deux exemplaires originaux.`,
    { color: COLORS.darkGray, size: 8.5 }
  )
  y += 4

  rect(15, W - 30, y, 40, [249, 249, 252])
  stroke(COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(15, y, W - 30, 40, 'S')

  const sigW = (W - 40) / 2
  textColor(COLORS.gray)
  font('bold', 8)
  doc.text('SIGNATURE DU CLIENT', 20, y + 7)
  font('normal', 7.5)
  doc.text(`${client.prenom} ${client.nom}`.trim(), 20, y + 13)
  doc.text('Précédée de la mention « Lu et approuvé »', 20, y + 18)
  doc.setLineDash([2, 2])
  stroke([200, 200, 200])
  doc.line(20, y + 33, 20 + sigW - 10, y + 33)

  const sig2x = 20 + sigW + 5
  font('bold', 8)
  textColor(COLORS.gray)
  doc.text('SIGNATURE DU PRESTATAIRE', sig2x, y + 7)
  font('normal', 7.5)
  doc.text(nomPre, sig2x, y + 13)
  doc.line(sig2x, y + 33, sig2x + sigW - 10, y + 33)
  doc.setLineDash([])
  y += 46

  // ── MENTION LÉGALE ────────────────────────────────────────────────────
  checkPageBreak(20)
  y += 2

  rect(15, W - 30, y, 16, [254, 249, 195])
  stroke([253, 230, 138])
  doc.setLineWidth(0.3)
  doc.rect(15, y, W - 30, 16, 'S')

  font('bold', 7.5)
  textColor([146, 64, 14])
  doc.text('⚠  MENTION LÉGALE', 20, y + 5.5)
  font('normal', 7)
  textColor([120, 53, 15])
  const disclaimer =
    "Ce contrat est fourni à titre indicatif par InstantMariage.fr et ne remplace pas un conseil juridique professionnel. " +
    "Les parties sont invitées à faire vérifier ce document par un juriste qualifié avant toute signature. " +
    "InstantMariage.fr décline toute responsabilité quant à l'utilisation de ce document."
  const discLines = doc.splitTextToSize(disclaimer, W - 36)
  doc.text(discLines, 20, y + 10.5)
  y += 20

  // ── FOOTER SUR TOUTES LES PAGES ───────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    fill(COLORS.pink)
    doc.rect(0, 285, W, 12, 'F')
    textColor([255, 255, 255])
    font('normal', 7.5)
    doc.text(
      `${prestataire.entreprise || prestataire.nom} • ${prestataire.email} • ${prestataire.telephone}`,
      W / 2, 292, { align: 'center' }
    )
    textColor([255, 200, 230])
    font('normal', 7)
    doc.text(`Page ${i} / ${pageCount}`, W - 15, 292, { align: 'right' })
  }

  const fileName = `Contrat_${provider.name}_${client.nom || 'Client'}_${evenement.dateMariage || 'date'}.pdf`
    .replace(/\s+/g, '_')
  doc.save(fileName)
}
