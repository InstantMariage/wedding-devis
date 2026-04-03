import { useState } from 'react'
import Header from './components/Header'
import StepSelector from './components/StepSelector'
import QuoteForm from './components/QuoteForm'
import QuotePreview from './components/QuotePreview'

export default function App() {
  const [step, setStep] = useState(1)
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [formData, setFormData] = useState(null)

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFormSubmit = (data) => {
    setFormData(data)
    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(s => s - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleReset = () => {
    setStep(1)
    setSelectedProvider(null)
    setFormData(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      <Header step={step} onBack={handleBack} onReset={handleReset} />
      <main className="container mx-auto px-4 max-w-6xl">
        {step === 1 && (
          <StepSelector onSelect={handleProviderSelect} />
        )}
        {step === 2 && selectedProvider && (
          <QuoteForm
            provider={selectedProvider}
            onSubmit={handleFormSubmit}
            onBack={() => { setStep(1); window.scrollTo({ top: 0 }) }}
          />
        )}
        {step === 3 && selectedProvider && formData && (
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
