import React from 'react'

export interface ServiceTileProps {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onClick: () => void
  variant?: 'default' | 'quick'
  color?: string
}

export const ServiceTile: React.FC<ServiceTileProps> = ({
  icon,
  label,
  sublabel,
  onClick,
  variant = 'default',
  color = 'bg-gray-700',
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-[#1a1d27] border border-gray-100 dark:border-white/10 rounded-3xl p-5 shadow-sm cursor-pointer hover:shadow-md dark:hover:bg-[#1f2333] transition-all active:scale-95 flex flex-col justify-between h-40 group"
    >
      <div className={`p-3 ${color} text-white rounded-2xl w-fit shadow-inner`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-glamp-600 dark:group-hover:text-green-400 transition-colors">{label}</h3>
        {sublabel && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}
