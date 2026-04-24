import { AnimatePresence, motion } from 'framer-motion'

const MotionParagraph = motion.p
const MotionSpan = motion.span

export function TypewriterText({ text, className = '' }) {
  return (
    <AnimatePresence mode="wait">
      <MotionParagraph
        key={text}
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`whitespace-pre-wrap text-sm leading-6 text-[#a8ffca] font-code ${className}`}
      >
        {(text || '').split('').map((char, index) => (
          <MotionSpan
            key={`${char}-${index}`}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: index * 0.008, 
              duration: 0.02,
              easing: [0.43, 0.13, 0.23, 0.96]
            }}
          >
            {char}
          </MotionSpan>
        ))}
      </MotionParagraph>
    </AnimatePresence>
  )
}
