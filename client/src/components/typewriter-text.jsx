import { AnimatePresence, motion } from 'framer-motion'

const MotionParagraph = motion.p
const MotionSpan = motion.span

export function TypewriterText({ text }) {
  return (
    <AnimatePresence mode="wait">
      <MotionParagraph
        key={text}
        initial={{ opacity: 0.2 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="whitespace-pre-wrap text-sm leading-6 text-[#a8ffca]"
      >
        {(text || '').split('').map((char, index) => (
          <MotionSpan
            key={`${char}-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.012, duration: 0.01 }}
          >
            {char}
          </MotionSpan>
        ))}
      </MotionParagraph>
    </AnimatePresence>
  )
}
