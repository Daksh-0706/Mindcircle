'use client'

import type { ElementType, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface GradientTextProps {
  /** Element to render as. Defaults to 'span'. */
  as?: ElementType
  children: ReactNode
  className?: string
}

/**
 * Thin wrapper that applies the `gradient-text` utility class to its children,
 * rendering the plum→terracotta gradient fill on the text.
 */
export default function GradientText({ as: Tag = 'span', children, className }: GradientTextProps) {
  return <Tag className={cn('gradient-text', className)}>{children}</Tag>
}
