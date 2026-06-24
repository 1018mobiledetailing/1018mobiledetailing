import { Plus } from 'lucide-react'

interface AddButtonProps {
  onClick: () => void
  label: string
  fixed?: boolean
}

export function AddButton({ onClick, label, fixed = false }: AddButtonProps) {
  if (fixed) {
    return (
      <button
        onClick={onClick}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 bg-blue-600 text-white rounded-full px-5 py-3 font-semibold shadow-lg active:scale-95"
        aria-label={label}
      >
        <Plus size={20} />
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-blue-600 text-white rounded-xl px-4 py-2.5 font-semibold text-sm active:scale-95"
      aria-label={label}
    >
      <Plus size={18} />
      {label}
    </button>
  )
}
