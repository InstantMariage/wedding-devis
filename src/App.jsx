import { useState, useCallback } from 'react'
import Header from './components/Header'
import StepSelector from './components/StepSelector'
import QuoteForm from './components/QuoteForm'
import QuotePreview from './components/QuotePreview'
import QuoteHistory from './components/QuoteHistory'
import InstallPrompt from './components/InstallPrompt'
import { saveQuote, loadHistory } from './utils/quoteHistory'

export default function App() {
  const [page, setPage] = useState('main') // 'main' | 'history'
  const [step, setStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [formData, setFormData] = useState(null)
  const [history, setHistory] = useState(() => loadHistory())

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFormSubmit = (data) => {
    setFormData(data)
    setStep(3)
    // Sauvegarde automatique dans l'historique
    saveQuote(data)
    setHistory(loadHistory())
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleReset = () => {
    setPage('main')
    setStep(1)
    setSelectedProvider(null)
    setFormData(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShowHistory = useCallback(() => {
    setHistory(loadHistory())
    setPage('history')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen">
      <InstallPrompt />
      <Header
        step={step}
        page={page}
        onBack={handleBack}
        onReset={handleReset}
        onShowHistory={handleShowHistory}
        historyCount={history.length}
      />
      <main className="container mx-auto px-4 max-w-6xl">
        {page === 'history' && (
          <QuoteHistory
            history={history}
            onNewQuote={handleReset}
          />
        )}
        {page === 'main' && step === 1 && (
          <StepSelector onSelect={handleProviderSelect} />
        )}
        {page === 'main' && step === 2 && selectedProvider && (
          <QuoteForm
            provider={selectedProvider}
            onSubmit={handleFormSubmit}
            onBack={() => { setStep(1); window.scrollTo({ top: 0 }) }}
          />
        )}
        {page === 'main' && step === 3 && selectedProvider && formData && (
          <QuotePreview
            provider={selectedProvider}
            formData={formData}
            onBack={() => setStep(2)}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}
