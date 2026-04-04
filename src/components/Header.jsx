import { ArrowLeft, RotateCcw, FolderOpen } from 'lucide-react'

const steps = [
  { n: 1, label: 'Prestataire' },
  { n: 2, label: 'Formulaire' },
  { n: 3, label: 'Aperçu & PDF' },
]

export default function Header({ step, onBack, onReset, onShowHistory, historyCount, page }) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {page === 'main' && step > 1 && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-pink-500 transition-colors mr-2"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
            )}
            {page === 'history' && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-pink-500 transition-colors mr-2"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
            )}
            <div>
              <h1 className="font-serif text-xl font-bold text-gray-800 leading-tight">
                <img src="/1024px - Other Use.png" alt="Logo" width={32} height={32} className="inline-block align-middle mr-1" />{' '}
                InstantMariage.fr | Générateur de Devis
              </h1>
              <p className="text-xs text-gray-400">Générateur de devis pour prestataires mariage</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bouton Mes devis */}
            <button
              onClick={onShowHistory}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors
                ${page === 'history'
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-pink-500 hover:bg-pink-50'}`}
            >
              <FolderOpen size={15} />
              <span className="hidden sm:inline">Mes devis</span>
              {historyCount > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold
                  ${page === 'history' ? 'bg-white/25 text-white' : 'bg-pink-100 text-pink-600'}`}>
                  {historyCount}
                </span>
              )}
            </button>

            {/* Étapes (uniquement sur la page principale) */}
            {page === 'main' && (
              <div className="hidden sm:flex items-center gap-1">
                {steps.map((s, i) => (
                  <div key={s.n} className="flex items-center">
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all
                      ${step === s.n ? 'bg-pink-500 text-white shadow-sm' :
                        step > s.n ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs
                        ${step === s.n ? 'bg-white/30' : step > s.n ? 'bg-pink-200' : 'bg-gray-200'}`}>
                        {step > s.n ? '✓' : s.n}
                      </span>
                      {s.label}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`w-6 h-px mx-1 ${step > s.n ? 'bg-pink-300' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {page === 'main' && step > 1 && (
              <button
                onClick={onReset}
                title="Recommencer"
                className="p-2 text-gray-400 hover:text-pink-400 hover:bg-pink-50 rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
