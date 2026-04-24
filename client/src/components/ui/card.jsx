import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const cardVariants = cva('terminal-panel rounded-lg border bg-black/55 backdrop-blur-sm transition-all duration-200', {
  variants: {
    variant: {
      default: 'border-[#1f4f2f] shadow-[0_0_0_1px_rgba(0,255,65,0.03)]',
      elevated: 'border-[#2a6f3f] bg-[#03120a]/88 shadow-[0_0_28px_rgba(0,255,65,0.12)]',
      panel: 'border-[#1f4f2f]/70 bg-black/65',
      danger: 'border-red-500/50 bg-black/65',
      success: 'border-emerald-500/50 bg-black/65',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

function Card({ className, variant, ...props }) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />
}

function CardHeader({ className, compact = false, ...props }) {
  return <div className={cn('flex flex-col p-4', compact ? 'space-y-0.5' : 'space-y-1', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return <h3 className={cn('terminal-heading text-sm font-semibold text-[#d8ffe6] leading-tight', className)} {...props} />
}

function CardDescription({ className, ...props }) {
  return <p className={cn('text-xs text-[#8bd3a0] leading-snug', className)} {...props} />
}

function CardContent({ className, dense = false, ...props }) {
  return <div className={cn('p-4 pt-0', dense && 'p-3 pt-0', className)} {...props} />
}

function CardFooter({ className, dense = false, ...props }) {
  return <div className={cn('flex items-center gap-2 p-4 pt-0', dense && 'p-3 pt-0', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
