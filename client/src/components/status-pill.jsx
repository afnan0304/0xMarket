import { cn } from '../lib/utils'

const toneClasses = {
  success: {
    shell: 'text-[#7dffab] border-[#1f4f2f]',
    dot: 'bg-[#00ff41]',
  },
  danger: {
    shell: 'text-red-400 border-red-500/40',
    dot: 'bg-red-400',
  },
  neutral: {
    shell: 'text-[#66c689] border-[#1f4f2f]',
    dot: 'bg-[#66c689]',
  },
}

export function StatusPill({ label, tone = 'neutral', className }) {
  const palette = toneClasses[tone] || toneClasses.neutral

  return (
    <div
      className={cn(
        'terminal-panel inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs uppercase tracking-[0.14em] backdrop-blur-sm',
        palette.shell,
        className,
      )}
    >
      <span className={cn('status-dot h-1.5 w-1.5 rounded-full', palette.dot)} />
      {label}
    </div>
  )
}
