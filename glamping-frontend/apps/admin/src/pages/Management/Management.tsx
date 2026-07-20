import { useState } from 'react'
import Menu from '../Menu/Menu'
import Services from '../Services/Services'
import InfoEditor from '../InfoEditor/InfoEditor'
import Andetta from '../Andetta/Andetta'

type ManagementTab = 'menu' | 'services' | 'info' | 'andetta'

const TABS: { id: ManagementTab; label: string }[] = [
  { id: 'menu', label: 'Меню' },
  { id: 'services', label: 'Услуги' },
  { id: 'info', label: 'Инфо' },
  { id: 'andetta', label: 'ANDETTA' },
]

export default function Management() {
  const [tab, setTab] = useState<ManagementTab>('menu')

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-4 pt-3 pb-2 shrink-0">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${tab === t.id ? 'bg-glamp-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/10'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'menu' && <Menu />}
        {tab === 'services' && <Services />}
        {tab === 'info' && <InfoEditor />}
        {tab === 'andetta' && <Andetta />}
      </div>
    </div>
  )
}
