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
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe"
      aria-label="Primary"
    >
      {/* Floating pill bar */}
      <div className="mx-auto mb-3 max-w-md px-4">
        <div className="grid grid-cols-5 rounded-[28px] bg-white shadow-[0_8px_32px_rgba(74,44,94,0.16)] px-1 py-2">
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
                  'relative flex flex-col items-center justify-center gap-0.5 rounded-3xl py-1.5 transition-all duration-200',
                  isActive ? 'bg-plum/[0.08]' : 'active:scale-95',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all duration-200',
                    isActive ? 'text-plum' : 'text-warm-gray-light',
                  )}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    'truncate text-[11px] leading-none transition-all duration-200',
                    isActive ? 'font-bold text-charcoal' : 'font-medium text-warm-gray-light',
                  )}
                >
                  {item.label}
                </span>
                {/* active dot */}
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-dot"
                    className="absolute bottom-0.5 h-1 w-1 rounded-full bg-plum"
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </motion.nav>
  )
}
