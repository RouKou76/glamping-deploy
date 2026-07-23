import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface City {
  id: string
  name: string
  km: number
  price: number
}

interface CityAutocompleteProps {
  cities: City[]
  value: string
  onChange: (city: City | null) => void
}

export function CityAutocomplete({ cities, value, onChange }: CityAutocompleteProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = query.length > 0
    ? cities.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(city: City) {
    setQuery(city.name)
    setIsOpen(false)
    onChange(city)
  }

  function handleChange(v: string) {
    setQuery(v)
    setIsOpen(v.length > 0)
    onChange(null)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => query.length > 0 && setIsOpen(true)}
        placeholder={t('transfer.searchCity')}
        className="w-full p-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-800 dark:text-white bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-glamp-500"
      />
      {isOpen && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-[#1a1d27] border border-gray-200 dark:border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filtered.map(city => (
            <button
              key={city.id}
              onClick={() => handleSelect(city)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex justify-between items-center"
            >
              <span className="text-gray-800 dark:text-white">{city.name}</span>
              <span className="text-xs text-gray-500 dark:text-white/50">{city.price} ₽</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
