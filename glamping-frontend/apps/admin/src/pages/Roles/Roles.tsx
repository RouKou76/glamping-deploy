import { useState, useEffect } from 'react'
import { useApi, apiPost, apiDelete } from '@glamping/api'
import { ConfirmDialog } from '@glamping/ui'

interface Role {
  id: string
  name: string
  permissions: string[]
  userCount: number
  createdAt: string
}

const ALL_PERMISSIONS = [
  { key: 'manage_users', label: 'Управление пользователями' },
  { key: 'manage_houses', label: 'Управление домиками' },
  { key: 'manage_services', label: 'Управление услугами' },
  { key: 'manage_menu', label: 'Управление меню' },
  { key: 'view_tickets', label: 'Просмотр заявок' },
  { key: 'manage_tickets', label: 'Управление заявками' },
  { key: 'manage_chat', label: 'Управление чатом' },
  { key: 'manage_settings', label: 'Управление настройками' },
  { key: 'manage_roles', label: 'Управление ролями' },
]

export default function Roles() {
  const { data: apiRoles, refetch } = useApi<Role[]>('/api/roles')
  const [roles, setRoles] = useState<Role[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [formName, setFormName] = useState('')
  const [formPermissions, setFormPermissions] = useState<string[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { if (apiRoles) setRoles(apiRoles) }, [apiRoles])

  function openCreate() { setEditRole(null); setFormName(''); setFormPermissions([]); setError(''); setShowForm(true) }
  function openEdit(role: Role) { setEditRole(role); setFormName(role.name); setFormPermissions([...(role.permissions ?? [])]); setError(''); setShowForm(true) }

  function togglePermission(perm: string) {
    setFormPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm])
  }

  async function handleSave() {
    if (!formName.trim()) { setError('Введите название роли'); return }
    try {
      if (editRole) {
        const updated = await apiPost<{ id: string; name: string; permissions: string[] }>(`/api/roles/${editRole.id}`, { name: formName.trim(), permissions: formPermissions })
        setRoles(prev => prev.map(r => r.id === editRole.id ? { ...r, name: updated.name, permissions: updated.permissions } : r))
      } else {
        const created = await apiPost<{ id: string; name: string; permissions: string[] }>('/api/roles', { name: formName.trim(), permissions: formPermissions })
        setRoles(prev => [...prev, { ...created, userCount: 0, createdAt: new Date().toISOString() }])
      }
      setShowForm(false)
    } catch { setError('Ошибка сохранения') }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await apiDelete(`/api/roles/${deleteId}`)
      setRoles(prev => prev.filter(r => r.id !== deleteId))
    } catch { /* ignore */ }
    setDeleteId(null)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Роли</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-glamp-600 text-white text-xs font-bold rounded-xl hover:bg-glamp-700 transition-colors active:scale-95">+ Добавить</button>
      </div>
      <div className="space-y-3">
        {roles.map(role => (
          <div key={role.id} className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-base font-bold text-gray-800 dark:text-white">{role.name}</p>
                <p className="text-xs text-gray-500 dark:text-white/50">{role.userCount} пользователей</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(role)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Изменить</button>
                {role.name !== 'admin' && <button onClick={() => setDeleteId(role.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/20 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">Удалить</button>}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(role.permissions ?? []).map(p => (
                <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-glamp-50 dark:bg-glamp-500/10 text-glamp-700 dark:text-glamp-300 border border-glamp-200 dark:border-glamp-500/20">{ALL_PERMISSIONS.find(ap => ap.key === p)?.label ?? p}</span>
              ))}
              {(!role.permissions || role.permissions.length === 0) && <span className="text-xs text-gray-400 dark:text-white/30">Нет прав</span>}
            </div>
          </div>
        ))}
        {roles.length === 0 && <p className="text-center text-gray-400 dark:text-white/30 text-sm py-8">Нет ролей</p>}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-end" onClick={() => setShowForm(false)}>
          <div className="w-full bg-gray-50 dark:bg-[#1a1d27] rounded-t-3xl p-6 space-y-4 animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{editRole ? 'Редактировать роль' : 'Новая роль'}</h3>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-white/60 mb-1 block">Название</label>
              <input type="text" value={formName} onChange={e => { setFormName(e.target.value); setError('') }} disabled={editRole?.name === 'admin'}
                className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-glamp-500 disabled:opacity-50" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-white/60 mb-2 block">Права доступа</label>
              <div className="space-y-2">
                {ALL_PERMISSIONS.map(p => (
                  <label key={p.key} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors">
                    <input type="checkbox" checked={formPermissions.includes(p.key)} onChange={() => togglePermission(p.key)}
                      className="w-4 h-4 rounded border-gray-300 text-glamp-600 focus:ring-glamp-500" />
                    <span className="text-sm text-gray-700 dark:text-white/80">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button onClick={() => setShowForm(false)} className="py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/50 text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">Отмена</button>
              <button onClick={handleSave} className="py-2.5 rounded-xl bg-glamp-600 hover:bg-glamp-700 text-white text-sm font-bold transition-colors active:scale-95">{editRole ? 'Сохранить' : 'Создать'}</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog open={!!deleteId} title="Удалить роль?" message="Роль будет удалена. Пользователи с этой ролью потеряют доступ." confirmLabel="Удалить" onConfirm={handleDelete} onClose={() => setDeleteId(null)} />
    </div>
  )
}
