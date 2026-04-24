import * as React from 'react'
import { cva } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md border font-semibold uppercase tracking-[0.14em] transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00ff41]',
  {
    variants: {
      variant: {
        default:
          'border-[#00ff41] bg-[#020d05] text-[#9effbf] shadow-[0_0_16px_rgba(0,255,65,0.12)] hover:-translate-y-0.5 hover:bg-[#00ff41] hover:text-black hover:shadow-[0_0_22px_rgba(0,255,65,0.28)]',
        ghost: 'border-[#1f4f2f] bg-transparent text-[#7ce69f] hover:-translate-y-0.5 hover:border-[#00ff41] hover:text-[#caffdc] hover:shadow-[0_0_18px_rgba(0,255,65,0.08)]',
        warning: 'border-amber-500/70 bg-amber-950/30 text-amber-300 hover:bg-amber-500/20',
        danger: 'border-red-500/70 bg-red-950/30 text-red-300 hover:bg-red-500/20',
        success: 'border-emerald-500/70 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-500/20',
      },
      size: {
        default: 'h-10 px-4 py-2 text-xs',
        sm: 'h-8 px-3 py-1 text-[11px]',
        lg: 'h-11 px-5 py-2 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button'

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button }
