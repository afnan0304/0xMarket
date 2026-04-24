import * as React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef(({ className, type = 'text', ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-[#1f4f2f] bg-black/70 px-2.5 py-1.5 text-xs text-[#d8ffe6] placeholder:text-[#4cae6c] shadow-[inset_0_0_0_1px_rgba(0,255,65,0.02)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00ff41] disabled:cursor-not-allowed disabled:border-[#1f4f2f]/40 disabled:text-[#66c689]/50 disabled:opacity-100 aria-[invalid=true]:border-red-500/70 aria-[invalid=true]:ring-red-500/70',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
