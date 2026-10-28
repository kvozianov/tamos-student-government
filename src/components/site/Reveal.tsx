'use client'

import { motion } from 'motion/react'

type Props = {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
  as?: 'div' | 'section' | 'li' | 'article' | 'header'
}

/** Мягкое появление блока при прокрутке. Срабатывает один раз; при «уменьшить движение» отключается. */
export function Reveal({ children, className, delay = 0, y = 18, as = 'div' }: Props) {
  const Tag = motion[as]
  return (
    <Tag
      data-reveal=""
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}
