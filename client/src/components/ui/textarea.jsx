import * as React from 'react'
import { cn } from '../../lib/utils'

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[96px] w-full rounded-none border border-[#1f4f2f] bg-black/70 px-2.5 py-1.5 text-xs text-[#c8ffd9] placeholder:text-[#4cae6c] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00ff41] disabled:cursor-not-allowed disabled:border-[#1f4f2f]/40 disabled:text-[#66c689]/50 disabled:opacity-100 aria-[invalid=true]:border-red-500/70 aria-[invalid=true]:ring-red-500/70',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
