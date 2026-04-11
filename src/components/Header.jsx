import { ArrowLeft, RotateCcw, FolderOpen } from 'lucide-react'

const steps = [
  { n: 1, label: 'Prestataire' },
  { n: 2, label: 'Formulaire' },
  { n: 3, label: 'Aperçu & PDF' },
]

export default function Header({ step, onBack, onReset, onShowHistory, historyCount, page }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-rose-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Gauche : bouton retour + logo */}
          <div className="flex items-center gap-3">
            {((page === 'main' && step > 1) || page === 'history') && (
              <button
                onClick={page === 'history' ? onReset : onBack}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-pink-500 transition-colors"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Retour</span>
              </button>
            )}

            {/* Logo identique à instantmariage.fr */}
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="InstantMariage"
                width={36}
                height={36}
                style={{ mixBlendMode: 'multiply' }}
                className="flex-shrink-0"
              />
              <span className="text-xl font-bold whitespace-nowrap">
                <span style={{ color: '#F06292' }}>Instant</span>
                <span className="text-gray-900">Mariage.fr</span>
              </span>
            </div>

            {/* Sous-titre app — desktop uniquement */}
            <span className="hidden lg:block text-xs text-gray-400 border-l border-gray-200 pl-3 ml-1">
              Générateur de devis
            </span>
          </div>

          {/* Centre : indicateur d'étapes */}
          {page === 'main' && (
            <div className="hidden sm:flex items-center gap-1">
              {steps.map((s, i) => (
                <div key={s.n} className="flex items-center">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                      ${step === s.n ? 'text-white shadow-sm' :
                        step > s.n ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}
                    style={step === s.n ? { background: 'linear-gradient(135deg, #F06292, #e91e8c)' } : {}}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-semibold
                      ${step === s.n ? 'bg-white/30 text-white' :
                        step > s.n ? 'bg-pink-200 text-pink-600' : 'bg-gray-200 text-gray-400'}`}>
                      {step > s.n ? '✓' : s.n}
                    </span>
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-5 h-px mx-1 ${step > s.n ? 'bg-pink-300' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Droite : actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onShowHistory}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all
                ${page === 'history'
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:text-pink-500 hover:bg-pink-50'}`}
              style={page === 'history' ? { background: 'linear-gradient(135deg, #F06292, #e91e8c)' } : {}}
            >
              <FolderOpen size={15} />
              <span className="hidden sm:inline">Mes devis</span>
              {historyCount > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold
                  ${page === 'history' ? 'bg-white/30 text-white' : 'bg-pink-100 text-pink-600'}`}>
                  {historyCount}
                </span>
              )}
            </button>

            {page === 'main' && step > 1 && (
              <button
                onClick={onReset}
                title="Recommencer"
                className="p-2 text-gray-400 hover:text-pink-400 hover:bg-pink-50 rounded-full transition-colors"
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
