import { useState } from 'react'
import Roles from '../Roles/Roles'
import Users from '../Users/Users'

type StaffTab = 'roles' | 'users'

const TABS: { id: StaffTab; label: string }[] = [
  { id: 'roles', label: 'Роли' },
  { id: 'users', label: 'Люди' },
]

export default function Staff() {
  const [tab, setTab] = useState<StaffTab>('roles')

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
        {tab === 'roles' && <Roles />}
        {tab === 'users' && <Users />}
      </div>
    </div>
  )
}
