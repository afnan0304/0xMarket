import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-semibold uppercase tracking-[0.12em] leading-tight',
  {
    variants: {
      variant: {
        default: 'border-[#26663c] bg-[#05180b] text-[#b2ffd1]',
        outline: 'border-[#1f4f2f] text-[#78d899] bg-transparent',
        success: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300',
        warning: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
        danger: 'border-red-500/40 bg-red-950/40 text-red-300',
        info: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2.5 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
)

function Badge({ className, variant, size, ...props }) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge }
