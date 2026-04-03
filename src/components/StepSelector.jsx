import { useState } from 'react'
import { providers, categories } from '../data/providers'
import { Search } from 'lucide-react'

export default function StepSelector({ onSelect }) {
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [search, setSearch] = useState('')

  const filtered = providers.filter(p => {
    const matchCat = activeCategory === 'Tous' || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="animate-fade-in py-8">
      {/* Titre */}
      <div className="text-center mb-10">
        <p className="text-pink-500 text-sm font-medium tracking-widest uppercase mb-3">
          Bienvenue
        </p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
          Créez votre devis mariage
          <br />
          <span className="text-pink-400">en quelques clics</span>
        </h2>
        <div className="gold-divider w-32 mx-auto mb-4" />
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Choisissez votre corps de métier pour générer un devis professionnel personnalisé.
        </p>
      </div>

      {/* Recherche */}
      <div className="relative max-w-md mx-auto mb-8">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un métier..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-100 bg-white/80 backdrop-blur
            focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent
            text-gray-700 placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Filtres catégories */}
      {!search && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {['Tous', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                ${activeCategory === cat
                  ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                  : 'bg-white text-gray-600 border border-pink-100 hover:border-pink-300 hover:text-pink-500'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grille */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(provider => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider)}
            className="group bg-white rounded-2xl p-5 text-center border border-pink-50 shadow-sm
              hover:shadow-lg hover:shadow-pink-100 hover:border-pink-200 hover:-translate-y-1
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
              {provider.emoji}
            </div>
            <p className="font-semibold text-gray-800 text-sm leading-tight mb-1">
              {provider.name}
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              {provider.description}
            </p>
            <div className="mt-3 text-xs text-pink-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Créer un devis →
            </div>
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>Aucun résultat pour « {search} »</p>
        </div>
      )}

      {/* Baseline */}
      <div className="text-center mt-12 text-sm text-gray-400">
        <div className="gold-divider w-24 mx-auto mb-4" />
        {providers.length} corps de métier • Devis PDF professionnel • 100% gratuit
      </div>
    </div>
  )
}
