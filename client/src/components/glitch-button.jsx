import { Button } from './ui/button'
import { cn } from '../lib/utils'

export function GlitchButton({ className, children, ...props }) {
  return (
    <Button className={cn('group glitch-button terminal-panel shadow-[0_0_16px_rgba(0,255,65,0.08)]', className)} {...props}>
      <span className="glitch-text">{children}</span>
    </Button>
  )
}
