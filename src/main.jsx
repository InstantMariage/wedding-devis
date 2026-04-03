import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerSW } from 'virtual:pwa-register'

// Enregistrement du service worker avec rechargement automatique
const updateSW = registerSW({
  onNeedRefresh() {
    // Nouvelle version disponible — on recharge silencieusement
    updateSW(true)
  },
  onOfflineReady() {
    console.log('Wedding Devis Pro est prêt à fonctionner hors ligne.')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
