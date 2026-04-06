import { useRef, useState } from 'react'
import { Download, Printer, ArrowLeft, RotateCcw, Receipt, FileText, X, CheckCircle } from 'lucide-react'
import { generatePDF } from '../utils/pdfGenerator'
import { generateInvoicePDF, getNextInvoiceNumber } from '../utils/invoiceGenerator'
import { generateContractPDF } from '../utils/contractGenerator'

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatEur(n) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function parseTva(str) {
  return parseFloat(str.replace(',', '.').replace('%', '').trim()) / 100
}

export default function QuotePreview({ provider, formData, onBack, onReset }) {
  const printRef = useRef()
  const {
    prestataire, client, evenement, prestations,
    specificValues, tva, acompte, conditions, numeroDevis,
  } = formData

  const tvaRate = parseTva(tva)
  const totalHT = prestations.reduce((s, p) => s + p.price * p.qty, 0)
  const montantTVA = totalHT * tvaRate
  const totalTTC = totalHT + montantTVA
  const acompteRate = parseFloat(acompte) / 100
  const montantAcompte = totalTTC * acompteRate
  const solde = totalTTC - montantAcompte

  // ── Invoice modal state ────────────────────────────────────────────────
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState(() => getNextInvoiceNumber())
  const [invoiceEcheance, setInvoiceEcheance] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().slice(0, 10)
  })
  const [marquePayee, setMarquePayee] = useState(false)
  const [generatingInvoice, setGeneratingInvoice] = useState(false)
  const [generatingContract, setGeneratingContract] = useState(false)

  const handleDownload = () => generatePDF(formData).catch(console.error)

  const handlePrint = () => window.print()

  const handleOpenInvoiceModal = () => {
    setInvoiceNumber(getNextInvoiceNumber())
    setShowInvoiceModal(true)
  }

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true)
    try {
      await generateInvoicePDF(formData, {
        numeroFacture: invoiceNumber,
        dateEcheance: invoiceEcheance,
        marquePayee,
      })
      setShowInvoiceModal(false)
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingInvoice(false)
    }
  }

  const handleGenerateContract = async () => {
    setGeneratingContract(true)
    try {
      await generateContractPDF(formData)
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingContract(false)
    }
  }

  const specEntries = Object.entries(specificValues || {}).filter(([, v]) => v)
  const fieldDefs = provider.specificFields || []

  return (
    <div className="animate-fade-in py-8">
      {/* Barre d'actions */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-800">
            Aperçu du devis
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Vérifiez les informations avant de télécharger
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200
              text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            <ArrowLeft size={16} /> Modifier
          </button>
          <button onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200
              text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            <Printer size={16} /> Imprimer
          </button>
          <button onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 rounded-xl
              bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold text-sm
              shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300
              hover:-translate-y-0.5 transition-all duration-200">
            <Download size={16} /> Devis PDF
          </button>
          <button onClick={handleOpenInvoiceModal}
            className="flex items-center gap-2 px-5 py-2 rounded-xl
              bg-gradient-to-r from-violet-500 to-violet-600 text-white font-semibold text-sm
              shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300
              hover:-translate-y-0.5 transition-all duration-200">
            <Receipt size={16} /> Convertir en facture
          </button>
          <button onClick={handleGenerateContract} disabled={generatingContract}
            className="flex items-center gap-2 px-5 py-2 rounded-xl
              bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold text-sm
              shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300
              hover:-translate-y-0.5 transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
            <FileText size={16} />
            {generatingContract ? 'Génération…' : 'Générer le contrat'}
          </button>
        </div>
      </div>

      {/* Document */}
      <div
        ref={printRef}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-pink-100"
        id="devis-document"
      >
        {/* ── En-tête rose ── */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-6 relative overflow-hidden">
          {/* Cercles décoratifs */}
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -right-2 top-8 w-20 h-20 rounded-full bg-white/10" />

          <div className="flex flex-wrap gap-6 items-start justify-between relative z-10">
            <div>
              <div className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">
                Document commercial
              </div>
              <h1 className="font-serif text-4xl font-bold text-white leading-tight">DEVIS</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{provider.emoji}</span>
                <span className="text-white/90 font-medium text-lg">{provider.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/70 text-xs uppercase tracking-wider">Référence</div>
              <div className="font-mono text-white font-bold text-lg">{numeroDevis}</div>
              <div className="text-white/70 text-xs mt-1">
                Émis le {formatDate(new Date().toISOString().slice(0, 10))}
              </div>
              <div className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-medium">
                Valable 30 jours
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* ── Prestataire + Client ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Prestataire */}
            <div className="bg-pink-50 rounded-xl p-5 border border-pink-100">
              <div className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-3">
                Prestataire
              </div>
              <div className="font-semibold text-gray-900 text-base">
                {prestataire.entreprise && <div>{prestataire.entreprise}</div>}
                <div className={prestataire.entreprise ? 'text-gray-600 font-normal text-sm' : ''}>
                  {prestataire.prenom} {prestataire.nom}
                </div>
              </div>
              <div className="mt-2 space-y-0.5 text-sm text-gray-500">
                {prestataire.adresse && <div>{prestataire.adresse}</div>}
                {(prestataire.codePostal || prestataire.ville) && (
                  <div>{prestataire.codePostal} {prestataire.ville}</div>
                )}
                {prestataire.telephone && <div>📞 {prestataire.telephone}</div>}
                {prestataire.email && <div>✉️ {prestataire.email}</div>}
                {prestataire.siteWeb && <div>🌐 {prestataire.siteWeb}</div>}
                {prestataire.siret && (
                  <div className="pt-1 text-xs text-gray-400">SIRET : {prestataire.siret}</div>
                )}
              </div>
            </div>

            {/* Client */}
            <div className="bg-pink-50 rounded-xl p-5 border border-pink-100">
              <div className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-3">
                Client
              </div>
              <div className="font-semibold text-gray-900 text-base">
                {client.prenom} {client.nom}
              </div>
              <div className="mt-2 space-y-0.5 text-sm text-gray-500">
                {client.adresse && <div>{client.adresse}</div>}
                {client.telephone && <div>📞 {client.telephone}</div>}
                {client.email && <div>✉️ {client.email}</div>}
              </div>
            </div>
          </div>

          {/* ── Événement ── */}
          <div className="bg-gradient-to-r from-pink-50 to-pink-50/50 rounded-xl p-4 border border-pink-100 mb-6">
            <div className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">
              Événement
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              {evenement.dateMariage && (
                <span className="flex items-center gap-1.5">
                  <span className="text-pink-400">📅</span>
                  <span className="font-medium">{formatDate(evenement.dateMariage)}</span>
                </span>
              )}
              {evenement.lieu && (
                <span className="flex items-center gap-1.5">
                  <span className="text-pink-400">🏰</span>
                  {evenement.lieu}
                </span>
              )}
              {evenement.ville && (
                <span className="flex items-center gap-1.5">
                  <span className="text-pink-400">📍</span>
                  {evenement.ville}
                </span>
              )}
              {evenement.nbInvites && (
                <span className="flex items-center gap-1.5">
                  <span className="text-pink-400">👥</span>
                  {evenement.nbInvites} invités
                </span>
              )}
            </div>
            {evenement.adresseLieu && (
              <div className="text-xs text-gray-400 mt-2">{evenement.adresseLieu}</div>
            )}
          </div>

          {/* ── Tableau prestations ── */}
          <div className="mb-6">
            <div className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-3">
              Détail des prestations
            </div>
            <div className="rounded-xl overflow-hidden border border-pink-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">
                      Désignation
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide w-16">
                      Qté
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide w-28">
                      Prix unit.
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wide w-28">
                      Total HT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {prestations.map((p, i) => (
                    <tr key={p.id}
                      className={`border-t border-pink-50 ${i % 2 === 0 ? 'bg-white' : 'bg-pink-50/30'}`}>
                      <td className="px-4 py-3 text-gray-700">{p.label}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{p.qty}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatEur(p.price)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-800">
                        {formatEur(p.price * p.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Totaux ── */}
          <div className="flex justify-end mb-6">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100">
                <span>Total HT</span>
                <span className="font-medium text-gray-800">{formatEur(totalHT)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100">
                <span>TVA ({tva})</span>
                <span className="font-medium text-gray-800">{formatEur(montantTVA)}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-gradient-to-r from-pink-500 to-pink-600
                rounded-xl text-white font-bold text-base">
                <span>TOTAL TTC</span>
                <span>{formatEur(totalTTC)}</span>
              </div>
              {parseFloat(acompte) > 0 && (
                <>
                  <div className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100">
                    <span>Acompte à la signature ({acompte} %)</span>
                    <span className="font-medium text-pink-600">{formatEur(montantAcompte)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold text-gray-800 py-1">
                    <span>Solde restant</span>
                    <span>{formatEur(solde)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Infos spécifiques ── */}
          {specEntries.length > 0 && (
            <div className="mb-6 p-4 bg-pink-50/50 rounded-xl border border-pink-100">
              <div className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-3">
                Informations spécifiques – {provider.name}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {specEntries.map(([id, val]) => {
                  const def = fieldDefs.find(f => f.id === id)
                  return (
                    <div key={id} className="flex gap-2">
                      <span className="text-gray-400">{def ? def.label : id} :</span>
                      <span className="text-gray-700 font-medium">{val}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Notes événement ── */}
          {evenement.notesComplementaires && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Notes complémentaires
              </div>
              <p className="text-sm text-gray-600 italic">{evenement.notesComplementaires}</p>
            </div>
          )}

          {/* ── Conditions ── */}
          <div className="mb-6 p-4 bg-pink-50/50 rounded-xl border border-pink-100">
            <div className="text-xs font-bold text-pink-500 uppercase tracking-wider mb-2">
              Conditions générales
            </div>
            <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">{conditions}</p>
          </div>

          {/* ── Zone signature ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
                Bon pour accord – Client
              </div>
              <div className="text-xs text-gray-400 italic mb-6">
                Date et signature précédées de « Lu et approuvé »
              </div>
              <div className="h-px bg-gray-300 mt-2" />
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">
                Signature du prestataire
              </div>
              <div className="text-xs text-gray-400 italic mb-6">
                {prestataire.prenom} {prestataire.nom}
              </div>
              <div className="h-px bg-gray-300 mt-2" />
            </div>
          </div>
        </div>

        {/* ── Pied de page ── */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-3 text-center">
          <p className="text-white/80 text-xs">
            {prestataire.entreprise || prestataire.nom}
            {prestataire.email && ` • ${prestataire.email}`}
            {prestataire.telephone && ` • ${prestataire.telephone}`}
            {prestataire.siret && ` • SIRET : ${prestataire.siret}`}
          </p>
        </div>
      </div>

      {/* Boutons bas */}
      <div className="no-print max-w-4xl mx-auto mt-6 flex flex-wrap gap-3 justify-between items-center">
        <button onClick={onReset}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-pink-500 transition-colors">
          <RotateCcw size={15} />
          Créer un nouveau devis
        </button>
        <button onClick={handleDownload}
          className="flex items-center gap-2 px-8 py-3 rounded-xl
            bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold
            shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300
            hover:-translate-y-0.5 transition-all duration-200">
          <Download size={18} />
          Télécharger le devis PDF
        </button>
      </div>

      {/* ── Modale facture ── */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setShowInvoiceModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">

            {/* Header modale */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-100">
                  <Receipt size={20} className="text-violet-600" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-gray-800">Convertir en facture</h3>
                  <p className="text-xs text-gray-400">Document identique au devis, format FACTURE</p>
                </div>
              </div>
              <button onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Numéro de facture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numéro de facture
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm
                    font-mono focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300"
                />
                <p className="text-xs text-gray-400 mt-1">Numérotation automatique — modifiable si besoin</p>
              </div>

              {/* Date d'échéance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={invoiceEcheance}
                  onChange={e => setInvoiceEcheance(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm
                    focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300"
                />
              </div>

              {/* Marquer comme payée */}
              <label className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100
                cursor-pointer hover:bg-green-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={marquePayee}
                  onChange={e => setMarquePayee(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-green-600 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <CheckCircle size={15} className={marquePayee ? 'text-green-600' : 'text-gray-400'} />
                    Marquer comme payée
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Ajoute un tampon <span className="font-semibold text-green-700">ACQUITTÉ</span> en vert sur le PDF
                  </div>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowInvoiceModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200
                  text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleGenerateInvoice} disabled={generatingInvoice || !invoiceNumber}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                  bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-semibold
                  shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300
                  hover:-translate-y-0.5 transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0">
                <Receipt size={15} />
                {generatingInvoice ? 'Génération…' : 'Générer la facture'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
