import { X } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

const toneToVariant = {
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
}

export function NoticeBanner({ notice, onDismiss }) {
  if (!notice?.message) {
    return null
  }

  return (
    <div className="mb-2 flex flex-col items-start justify-between gap-2 rounded-xl border border-[#1f4f2f]/60 bg-black/40 px-3 py-2 shadow-[0_0_16px_rgba(0,255,65,0.04)] sm:flex-row sm:items-center" role="status" aria-live="polite">
      <Badge variant={toneToVariant[notice.tone] || 'info'}>{notice.message}</Badge>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDismiss} aria-label="Dismiss notice">
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
