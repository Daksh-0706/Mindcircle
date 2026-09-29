'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, BookOpen, Users, BarChart3, MessageCircle } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/constants'
import { cn } from '../../lib/utils'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-40 glass-card border-t border-white/50 pb-safe"
    >
      <div className="grid grid-cols-5 h-14">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = {
            Home: Home,
            BookOpen: BookOpen,
            Users: Users,
            BarChart3: BarChart3,
            MessageCircle: MessageCircle,
          }[item.icon]

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-all duration-200',
                isActive
                  ? 'text-plum'
                  : 'text-warm-gray-light active:text-plum'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-all duration-200',
                  isActive && 'scale-110'
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'text-xs font-medium transition-all duration-200',
                  isActive && 'font-semibold'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}