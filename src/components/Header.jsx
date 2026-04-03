import { ArrowLeft, RotateCcw } from 'lucide-react'

const steps = [
  { n: 1, label: 'Prestataire' },
  { n: 2, label: 'Formulaire' },
  { n: 3, label: 'Aperçu & PDF' },
]

export default function Header({ step, onBack, onReset }) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-pink-500 transition-colors mr-2"
              >
                <ArrowLeft size={16} />
                Retour
              </button>
            )}
            <div>
              <h1 className="font-serif text-xl font-bold text-gray-800 leading-tight">
                <span className="text-pink-400">✦</span>{' '}
                InstantMariage.fr | Générateur de Devis
              </h1>
              <p className="text-xs text-gray-400">Générateur de devis pour prestataires mariage</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Étapes */}
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

            {step > 1 && (
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
