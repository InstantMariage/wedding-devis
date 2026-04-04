import { useState } from 'react'
import { Download, Trash2, FileText, Calendar, User, Euro, RotateCcw, AlertCircle } from 'lucide-react'
import { generatePDF } from '../utils/pdfGenerator'
import { deleteQuote } from '../utils/quoteHistory'

function formatDate(isoStr) {
  if (!isoStr) return '—'
  return new Date(isoStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatEur(n) {
  const parts = n.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return parts.join(',') + '\u00a0€'
}

export default function QuoteHistory({ history: initialHistory, onNewQuote }) {
  const [history, setHistory] = useState(initialHistory)
  const [downloading, setDownloading] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const handleDownload = async (entry) => {
    setDownloading(entry.id)
    try {
      await generatePDF(entry.formData)
    } catch (err) {
      console.error(err)
    } finally {
      setDownloading(null)
    }
  }

  const handleDelete = (id) => {
    const updated = deleteQuote(id)
    setHistory(updated)
    setConfirmDelete(null)
  }

  if (history.length === 0) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto py-16 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">Aucun devis sauvegardé</h2>
        <p className="text-gray-400 mb-8">
          Vos devis générés apparaîtront ici automatiquement.
        </p>
        <button
          onClick={onNewQuote}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
            bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold
            shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300
            hover:-translate-y-0.5 transition-all duration-200"
        >
          <RotateCcw size={16} />
          Créer un devis
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto py-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-800">Mes devis</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {history.length} devis sauvegardé{history.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onNewQuote}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold text-sm
            shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300
            hover:-translate-y-0.5 transition-all duration-200"
        >
          <RotateCcw size={15} />
          Nouveau devis
        </button>
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-2xl border border-pink-100 shadow-sm
              hover:shadow-md hover:border-pink-200 transition-all duration-200"
          >
            <div className="flex flex-wrap items-center gap-4 p-5">
              {/* Icône métier */}
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-2xl flex-shrink-0">
                {entry.providerEmoji}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mb-1">
                  <span className="font-semibold text-gray-800 text-sm">{entry.numeroDevis}</span>
                  <span className="text-xs text-pink-500 font-medium bg-pink-50 px-2 py-0.5 rounded-full">
                    {entry.providerName}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User size={11} />
                    {entry.clientName || '—'}
                  </span>
                  {entry.dateMariage && (
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      Mariage : {formatDate(entry.dateMariage)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <FileText size={11} />
                    Créé le {formatDate(entry.savedAt)}
                  </span>
                </div>
              </div>

              {/* Montant */}
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-gray-800">{formatEur(entry.totalTTC)}</div>
                <div className="text-xs text-gray-400">TTC</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleDownload(entry)}
                  disabled={downloading === entry.id}
                  title="Télécharger le PDF"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl
                    bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-medium
                    transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  <Download size={14} />
                  {downloading === entry.id ? 'Génération…' : 'PDF'}
                </button>
                <button
                  onClick={() => setConfirmDelete(entry.id)}
                  title="Supprimer"
                  className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Confirmation suppression */}
            {confirmDelete === entry.id && (
              <div className="px-5 pb-4 flex items-center gap-3 border-t border-pink-50 pt-3">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 flex-1">
                  Supprimer définitivement ce devis ?
                </span>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded-lg
                    border border-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg
                    transition-colors font-medium"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
