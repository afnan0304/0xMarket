import { Button } from './ui/button'
import { cn } from '../lib/utils'

export function GlitchButton({ className, children, size, ...props }) {
  return (
    <Button 
      className={cn(
        'group glitch-button relative overflow-hidden',
        'hover:shadow-lg hover:shadow-[#00ff41]/30 transition-all duration-200',
        'active:shadow-xl active:shadow-[#00ff41]/40',
        className
      )} 
      size={size}
      {...props}
    >
      <span className="glitch-text font-medium">{children}</span>
    </Button>
  )
}
