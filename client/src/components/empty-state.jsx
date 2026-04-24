import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from './ui/card'

export function EmptyState({ title, description }) {
  return (
    <Card variant="panel">
      <CardContent className="flex items-start gap-2 pt-3 text-xs text-[#66c689]">
        <AlertCircle className="mt-0.5 h-4 w-4 text-[#66c689]" />
        <div>
          <p className="text-[#9effbf]">{title}</p>
          <p className="mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
