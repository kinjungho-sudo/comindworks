import { useDraggable } from '@dnd-kit/core'
import { getCategoryColor, getCategoryLabel, getTierLabel } from '../../lib/utils'

export default function AbilityCard({ ability, disabled = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ability.id,
    data: { ability },
    disabled,
  })

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    zIndex: 999,
  } : undefined

  const categoryColor = getCategoryColor(ability.category)

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: categoryColor + '40',
        backgroundColor: categoryColor + '15',
      }}
      {...listeners}
      {...attributes}
      className={`
        p-2 rounded-lg border select-none transition-opacity
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}
        ${isDragging ? 'opacity-50' : !disabled && 'hover:border-brand-500/50'}
      `}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded text-xs flex items-center justify-center font-bold flex-shrink-0"
          style={{ backgroundColor: categoryColor + '30', color: categoryColor }}
        >
          {ability.icon?.replace('icon_', '').slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-medium text-white truncate">{ability.name}</div>
          <div className="text-xs" style={{ color: categoryColor + 'aa' }}>
            {getCategoryLabel(ability.category)} · {getTierLabel(ability.tier_required)}
          </div>
        </div>
      </div>
    </div>
  )
}
