import { useState, useEffect } from 'react'
import { Download, X, Share } from 'lucide-react'

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Déjà installée en standalone → on n'affiche rien
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (window.navigator.standalone === true) return
    // Déjà refusée cette session
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    if (ios) {
      // Sur iOS, on affiche la bannière d'instruction Share après 3 s
      const t = setTimeout(() => setIsVisible(true), 3000)
      return () => clearTimeout(t)
    }

    // Android / Chrome : attendre l'événement beforeinstallprompt
    const handler = (e) => {
      e.preventDefault()
      setInstallEvent(e)
      setTimeout(() => setIsVisible(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') {
      setIsVisible(false)
    }
    setInstallEvent(null)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    sessionStorage.setItem('pwa-prompt-dismissed', '1')
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 safe-area-bottom">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-pink-200 overflow-hidden">
        {/* Bandeau rose en haut */}
        <div className="h-1 bg-gradient-to-r from-pink-400 via-pink-500 to-rose-400" />

        <div className="p-4 flex items-start gap-3">
          {/* Icône de l'app */}
          <img
            src="/icons/pwa-192.svg"
            alt="Wedding Devis Pro"
            className="w-14 h-14 rounded-xl flex-shrink-0 shadow"
          />

          <div className="flex-1 min-w-0">
            <p className="font-serif font-bold text-pink-700 text-sm leading-tight">
              Installer Wedding Devis Pro
            </p>

            {isIOS ? (
              <p className="text-xs text-gray-500 mt-1 leading-snug">
                Appuyez sur{' '}
                <Share size={12} className="inline text-blue-500 mx-0.5" />
                <strong>Partager</strong> puis{' '}
                <strong>« Sur l'écran d'accueil »</strong> pour installer l'app.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1 leading-snug">
                Installez l'app pour y accéder hors ligne, depuis votre écran d'accueil.
              </p>
            )}
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Bouton d'installation (Android/Chrome seulement) */}
        {!isIOS && installEvent && (
          <div className="px-4 pb-4">
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold py-2.5 rounded-xl shadow hover:opacity-90 transition-opacity"
            >
              <Download size={16} />
              Installer l'application
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
