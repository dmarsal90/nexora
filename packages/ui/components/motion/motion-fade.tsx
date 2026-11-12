import type { ReactNode } from 'react'
import { LazyMotion, domAnimation, m, useReducedMotion } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'

type MotionFadeProps = Omit<HTMLMotionProps<'div'>, 'children'> & {
  children: ReactNode
  delay?: number
}

export function MotionFade({ children, delay = 0, ...props }: MotionFadeProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.22, delay, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </m.div>
    </LazyMotion>
  )
}
