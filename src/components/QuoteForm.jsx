import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'

const TVA_RATES = ['0 %', '5,5 %', '10 %', '20 %']

const initialPrestataire = {
  nom: '', prenom: '', entreprise: '', siret: '',
  adresse: '', codePostal: '', ville: '',
  telephone: '', email: '', siteWeb: '',
}

const initialClient = {
  nom: '', prenom: '', telephone: '', email: '', adresse: '',
}

const initialEvenement = {
  dateMariage: '', lieu: '', adresseLieu: '', ville: '',
  nbInvites: '', notesComplementaires: '',
}

function SectionTitle({ children, subtitle }) {
  return (
    <div className="mb-6">
      <h3 className="font-serif text-xl font-semibold text-gray-800">{children}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      <div className="gold-divider w-16 mt-2" />
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-pink-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass = `w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white
  focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent
  text-gray-800 placeholder-gray-300 text-sm transition-all`

const selectClass = `${inputClass} cursor-pointer`

export default function QuoteForm({ provider, onSubmit, onBack }) {
  const [prestataire, setPrestataire] = useState(initialPrestataire)
  const [client, setClient] = useState(initialClient)
  const [evenement, setEvenement] = useState(initialEvenement)
  const [tva, setTva] = useState('20 %')
  const [acompte, setAcompte] = useState('30')
  const [conditions, setConditions] = useState(
    `Devis valable 30 jours. Un acompte est demandé à la signature du contrat.\nSauf en cas de force majeure, l'annulation du contrat entraîne la conservation de l'acompte.\nTout déplacement hors de la zone prévue peut être facturé en supplément.`
  )
  const [numeroDevis, setNumeroDevis] = useState(
    `DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  )

  // Prestations sélectionnées : copie avec checkbox + prix modifiable
  const [prestations, setPrestations] = useState(
    provider.prestations.map(p => ({ ...p, selected: !!p.included, qty: 1 }))
  )
  const [customPrestations, setCustomPrestations] = useState([])

  // Champs spécifiques
  const [specificValues, setSpecificValues] = useState(
    Object.fromEntries((provider.specificFields || []).map(f => [f.id, '']))
  )

  const [errors, setErrors] = useState({})
  const [openSection, setOpenSection] = useState(null)

  const togglePrestation = (id) => {
    setPrestations(prev => prev.map(p => p.id === id ? { ...p, selected: !p.selected } : p))
  }

  const updatePrestationPrice = (id, val) => {
    setPrestations(prev => prev.map(p => p.id === id ? { ...p, price: parseFloat(val) || 0 } : p))
  }

  const updatePrestationQty = (id, val) => {
    setPrestations(prev => prev.map(p => p.id === id ? { ...p, qty: parseInt(val) || 1 } : p))
  }

  const addCustomPrestation = () => {
    setCustomPrestations(prev => [
      ...prev,
      { id: `c${Date.now()}`, label: '', price: 0, qty: 1, selected: true }
    ])
  }

  const updateCustom = (id, field, val) => {
    setCustomPrestations(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: field === 'price' ? parseFloat(val) || 0 : val } : p
    ))
  }

  const removeCustom = (id) => {
    setCustomPrestations(prev => prev.filter(p => p.id !== id))
  }

  const validate = () => {
    const e = {}
    if (!prestataire.nom.trim()) e['pnom'] = true
    if (!prestataire.email.trim()) e['pemail'] = true
    if (!client.nom.trim()) e['cnom'] = true
    if (!evenement.dateMariage) e['date'] = true
    if (!evenement.lieu.trim()) e['lieu'] = true
    const hasPrestation = prestations.some(p => p.selected) || customPrestations.some(p => p.selected && p.label)
    if (!hasPrestation) e['prestations'] = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    onSubmit({
      prestataire,
      client,
      evenement,
      prestations: [
        ...prestations.filter(p => p.selected),
        ...customPrestations.filter(p => p.selected && p.label),
      ],
      specificValues,
      tva,
      acompte,
      conditions,
      numeroDevis,
      provider,
    })
  }

  const errCount = Object.keys(errors).length

  return (
    <div className="animate-fade-in max-w-3xl mx-auto py-8">
      {/* En-tête */}
      <div className="text-center mb-8">
        <span className="text-5xl">{provider.emoji}</span>
        <h2 className="font-serif text-3xl font-bold text-gray-800 mt-3 mb-1">
          Devis – {provider.name}
        </h2>
        <p className="text-gray-400">{provider.description}</p>
      </div>

      {errCount > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
          <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">
            {errCount} champ{errCount > 1 ? 's' : ''} requis manquant{errCount > 1 ? 's' : ''}.
            Veuillez compléter les champs marqués en rouge.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── Référence devis ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
          <div className="flex flex-wrap gap-4 items-center">
            <Field label="N° de devis">
              <input className={inputClass} value={numeroDevis}
                onChange={e => setNumeroDevis(e.target.value)} />
            </Field>
            <Field label="Date du devis">
              <input type="date" className={inputClass}
                defaultValue={new Date().toISOString().slice(0, 10)} readOnly />
            </Field>
          </div>
        </div>

        {/* ── Prestataire ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
          <button type="button"
            className="w-full flex items-center justify-between p-6 text-left hover:bg-pink-50/30 transition-colors"
            onClick={() => setOpenSection(openSection === 'pre' ? null : 'pre')}>
            <SectionTitle subtitle="Vos coordonnées professionnelles">
              <span className="flex items-center gap-2">
                {errors.pnom || errors.pemail ? <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> : null}
                1. Vos informations
              </span>
            </SectionTitle>
            {openSection === 'pre' ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
          </button>
          {openSection !== 'pre' && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom" required>
                  <input className={`${inputClass} ${errors.pnom ? 'border-red-400 ring-1 ring-red-300' : ''}`}
                    value={prestataire.nom} onChange={e => setPrestataire(p => ({ ...p, nom: e.target.value }))}
                    placeholder="Martin" />
                </Field>
                <Field label="Prénom">
                  <input className={inputClass} value={prestataire.prenom}
                    onChange={e => setPrestataire(p => ({ ...p, prenom: e.target.value }))} placeholder="Sophie" />
                </Field>
                <Field label="Nom de l'entreprise">
                  <input className={inputClass} value={prestataire.entreprise}
                    onChange={e => setPrestataire(p => ({ ...p, entreprise: e.target.value }))}
                    placeholder="Studio Martin Photography" />
                </Field>
                <Field label="N° SIRET">
                  <input className={inputClass} value={prestataire.siret}
                    onChange={e => setPrestataire(p => ({ ...p, siret: e.target.value }))}
                    placeholder="123 456 789 00012" />
                </Field>
                <Field label="Adresse">
                  <input className={inputClass} value={prestataire.adresse}
                    onChange={e => setPrestataire(p => ({ ...p, adresse: e.target.value }))}
                    placeholder="12 rue des Fleurs" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Code postal">
                    <input className={inputClass} value={prestataire.codePostal}
                      onChange={e => setPrestataire(p => ({ ...p, codePostal: e.target.value }))}
                      placeholder="75000" />
                  </Field>
                  <Field label="Ville">
                    <input className={inputClass} value={prestataire.ville}
                      onChange={e => setPrestataire(p => ({ ...p, ville: e.target.value }))}
                      placeholder="Paris" />
                  </Field>
                </div>
                <Field label="Téléphone">
                  <input className={inputClass} type="tel" value={prestataire.telephone}
                    onChange={e => setPrestataire(p => ({ ...p, telephone: e.target.value }))}
                    placeholder="06 00 00 00 00" />
                </Field>
                <Field label="Email" required>
                  <input className={`${inputClass} ${errors.pemail ? 'border-red-400 ring-1 ring-red-300' : ''}`}
                    type="email" value={prestataire.email}
                    onChange={e => setPrestataire(p => ({ ...p, email: e.target.value }))}
                    placeholder="contact@studio-martin.fr" />
                </Field>
                <Field label="Site web">
                  <input className={inputClass} value={prestataire.siteWeb}
                    onChange={e => setPrestataire(p => ({ ...p, siteWeb: e.target.value }))}
                    placeholder="www.studio-martin.fr" />
                </Field>
              </div>
            </div>
          )}
        </div>

        {/* ── Client & Événement ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-50 overflow-hidden">
          <button type="button"
            className="w-full flex items-center justify-between p-6 text-left hover:bg-pink-50/30 transition-colors"
            onClick={() => setOpenSection(openSection === 'cli' ? null : 'cli')}>
            <SectionTitle subtitle="Coordonnées des mariés et détails de l'événement">
              <span className="flex items-center gap-2">
                {errors.cnom || errors.date || errors.lieu ? <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> : null}
                2. Client &amp; Événement
              </span>
            </SectionTitle>
            {openSection === 'cli' ? <ChevronUp size={20} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />}
          </button>
          {openSection !== 'cli' && (
            <div className="px-6 pb-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom du/de la marié(e)" required>
                  <input className={`${inputClass} ${errors.cnom ? 'border-red-400 ring-1 ring-red-300' : ''}`}
                    value={client.nom} onChange={e => setClient(c => ({ ...c, nom: e.target.value }))}
                    placeholder="Dupont" />
                </Field>
                <Field label="Prénom">
                  <input className={inputClass} value={client.prenom}
                    onChange={e => setClient(c => ({ ...c, prenom: e.target.value }))}
                    placeholder="Marie &amp; Pierre" />
                </Field>
                <Field label="Téléphone">
                  <input className={inputClass} type="tel" value={client.telephone}
                    onChange={e => setClient(c => ({ ...c, telephone: e.target.value }))}
                    placeholder="06 00 00 00 00" />
                </Field>
                <Field label="Email">
                  <input className={inputClass} type="email" value={client.email}
                    onChange={e => setClient(c => ({ ...c, email: e.target.value }))}
                    placeholder="marie.pierre@email.fr" />
                </Field>
                <Field label="Adresse du client">
                  <input className={inputClass} value={client.adresse}
                    onChange={e => setClient(c => ({ ...c, adresse: e.target.value }))}
                    placeholder="3 avenue des Roses, 69000 Lyon" />
                </Field>
              </div>

              <div className="gold-divider" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date du mariage" required>
                  <input type="date" className={`${inputClass} ${errors.date ? 'border-red-400 ring-1 ring-red-300' : ''}`}
                    value={evenement.dateMariage}
                    onChange={e => setEvenement(ev => ({ ...ev, dateMariage: e.target.value }))} />
                </Field>
                <Field label="Nombre d'invités">
                  <input type="number" className={inputClass} value={evenement.nbInvites}
                    onChange={e => setEvenement(ev => ({ ...ev, nbInvites: e.target.value }))}
                    placeholder="80" min="1" />
                </Field>
                <Field label="Lieu / Domaine" required>
                  <input className={`${inputClass} ${errors.lieu ? 'border-red-400 ring-1 ring-red-300' : ''}`}
                    value={evenement.lieu}
                    onChange={e => setEvenement(ev => ({ ...ev, lieu: e.target.value }))}
                    placeholder="Château de Fontainebleau" />
                </Field>
                <Field label="Ville du mariage">
                  <input className={inputClass} value={evenement.ville}
                    onChange={e => setEvenement(ev => ({ ...ev, ville: e.target.value }))}
                    placeholder="Fontainebleau (77)" />
                </Field>
                <Field label="Adresse complète du lieu">
                  <input className={inputClass} value={evenement.adresseLieu}
                    onChange={e => setEvenement(ev => ({ ...ev, adresseLieu: e.target.value }))}
                    placeholder="1 rue du Château, 77300 Fontainebleau" />
                </Field>
              </div>
              <Field label="Notes complémentaires">
                <textarea className={`${inputClass} resize-none`} rows={3}
                  value={evenement.notesComplementaires}
                  onChange={e => setEvenement(ev => ({ ...ev, notesComplementaires: e.target.value }))}
                  placeholder="Informations utiles : accès, particularités, demandes spéciales…" />
              </Field>
            </div>
          )}
        </div>

        {/* ── Prestations ── */}
        <div className={`bg-white rounded-2xl shadow-sm overflow-hidden
          ${errors.prestations ? 'border border-red-300' : 'border border-pink-50'}`}>
          <div className="p-6">
            <SectionTitle subtitle="Sélectionnez et ajustez vos services et tarifs">
              <span className="flex items-center gap-2">
                {errors.prestations && <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />}
                3. Prestations &amp; Tarifs
              </span>
            </SectionTitle>

            {errors.prestations && (
              <p className="text-sm text-red-500 mb-4">
                Veuillez sélectionner au moins une prestation.
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-gray-500 font-medium w-8"></th>
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Désignation</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium w-20">Qté</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium w-28">Prix unit. (€)</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {prestations.map(p => (
                    <tr key={p.id}
                      className={`border-b border-gray-50 transition-colors
                        ${p.selected ? 'bg-pink-50/30' : 'opacity-50'}`}>
                      <td className="py-2.5 px-2">
                        <input type="checkbox" checked={p.selected}
                          onChange={() => togglePrestation(p.id)}
                          className="w-4 h-4 accent-pink-500 cursor-pointer rounded" />
                      </td>
                      <td className="py-2.5 px-2 text-gray-700">{p.label}</td>
                      <td className="py-2.5 px-2">
                        <input type="number" min="1" value={p.qty}
                          onChange={e => updatePrestationQty(p.id, e.target.value)}
                          disabled={!p.selected}
                          className="w-16 text-right px-2 py-1 rounded-lg border border-gray-200
                            focus:outline-none focus:ring-1 focus:ring-pink-300 text-sm disabled:bg-gray-50" />
                      </td>
                      <td className="py-2.5 px-2">
                        <input type="number" min="0" step="0.01" value={p.price}
                          onChange={e => updatePrestationPrice(p.id, e.target.value)}
                          disabled={!p.selected}
                          className="w-24 text-right px-2 py-1 rounded-lg border border-gray-200
                            focus:outline-none focus:ring-1 focus:ring-pink-300 text-sm disabled:bg-gray-50" />
                      </td>
                      <td className="py-2.5 px-2 text-right font-medium text-gray-800">
                        {p.selected ? `${(p.price * p.qty).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €` : '—'}
                      </td>
                    </tr>
                  ))}

                  {/* Prestations personnalisées */}
                  {customPrestations.map(p => (
                    <tr key={p.id} className="border-b border-gray-50 bg-amber-50/30">
                      <td className="py-2.5 px-2">
                        <input type="checkbox" checked={p.selected}
                          onChange={() => setCustomPrestations(prev =>
                            prev.map(c => c.id === p.id ? { ...c, selected: !c.selected } : c))}
                          className="w-4 h-4 accent-pink-500 cursor-pointer" />
                      </td>
                      <td className="py-2.5 px-2">
                        <input className="w-full px-2 py-1 rounded-lg border border-gray-200
                          focus:outline-none focus:ring-1 focus:ring-pink-300 text-sm bg-white"
                          value={p.label} placeholder="Désignation personnalisée"
                          onChange={e => updateCustom(p.id, 'label', e.target.value)} />
                      </td>
                      <td className="py-2.5 px-2">
                        <input type="number" min="1" value={p.qty}
                          onChange={e => updateCustom(p.id, 'qty', parseInt(e.target.value) || 1)}
                          className="w-16 text-right px-2 py-1 rounded-lg border border-gray-200
                            focus:outline-none focus:ring-1 focus:ring-pink-300 text-sm" />
                      </td>
                      <td className="py-2.5 px-2">
                        <input type="number" min="0" step="0.01" value={p.price}
                          onChange={e => updateCustom(p.id, 'price', e.target.value)}
                          className="w-24 text-right px-2 py-1 rounded-lg border border-gray-200
                            focus:outline-none focus:ring-1 focus:ring-pink-300 text-sm" />
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-medium text-gray-800">
                            {(p.price * p.qty).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </span>
                          <button type="button" onClick={() => removeCustom(p.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button type="button" onClick={addCustomPrestation}
              className="mt-4 flex items-center gap-2 text-sm text-pink-500 hover:text-pink-600
                font-medium transition-colors">
              <Plus size={16} />
              Ajouter une prestation personnalisée
            </button>
          </div>
        </div>

        {/* ── Champs spécifiques ── */}
        {provider.specificFields && provider.specificFields.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
            <SectionTitle subtitle="Informations spécifiques à votre prestation">
              4. Options spécifiques – {provider.name}
            </SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {provider.specificFields.map(f => (
                <Field key={f.id} label={f.label}>
                  {f.type === 'select' ? (
                    <select className={selectClass}
                      value={specificValues[f.id]}
                      onChange={e => setSpecificValues(v => ({ ...v, [f.id]: e.target.value }))}>
                      <option value="">— Choisir —</option>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      className={inputClass}
                      value={specificValues[f.id]}
                      onChange={e => setSpecificValues(v => ({ ...v, [f.id]: e.target.value }))}
                      placeholder={f.placeholder || ''} />
                  )}
                </Field>
              ))}
            </div>
          </div>
        )}

        {/* ── TVA & Conditions ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-pink-50">
          <SectionTitle subtitle="Paramètres financiers et mentions légales">
            5. Conditions financières
          </SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Field label="Taux de TVA">
              <select className={selectClass} value={tva} onChange={e => setTva(e.target.value)}>
                {TVA_RATES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Acompte demandé (%)">
              <input type="number" min="0" max="100" className={inputClass}
                value={acompte} onChange={e => setAcompte(e.target.value)} />
            </Field>
          </div>
          <Field label="Conditions générales de vente">
            <textarea className={`${inputClass} resize-none font-mono text-xs`} rows={4}
              value={conditions} onChange={e => setConditions(e.target.value)} />
          </Field>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-4 justify-between pt-2 pb-8">
          <button type="button" onClick={onBack}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium
              hover:bg-gray-50 transition-colors">
            ← Retour
          </button>
          <button type="submit"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500
              text-white font-semibold text-sm shadow-lg shadow-pink-200
              hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400">
            Générer l'aperçu du devis →
          </button>
        </div>
      </form>
    </div>
  )
}
