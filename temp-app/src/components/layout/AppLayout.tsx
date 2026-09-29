'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { SideNav } from './SideNav'
import { MobileHeader } from './MobileHeader'
import BottomNav from './BottomNav'
import { TopBar } from './TopBar'
import { useIsMobile, useIsDesktop } from '../../hooks/useMediaQuery'
import { cn } from '../../lib/utils'

interface AppLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  showTopBar?: boolean
  showMobileHeader?: boolean
  showBottomNav?: boolean
  rightSidebar?: React.ReactNode
  userName?: string
  userInitials?: string
  userRole?: string
}

export function AppLayout({
  children,
  pageTitle = 'MindCircle',
  showTopBar = true,
  showMobileHeader = true,
  showBottomNav = true,
  rightSidebar,
  userName,
  userInitials,
  userRole,
}: AppLayoutProps) {
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isMobile) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        {showMobileHeader && (
          <MobileHeader
            title={pageTitle}
            showBack={false}
            onMenu={() => setSidebarOpen(true)}
          />
        )}
        <div className="relative flex-1 overflow-hidden">
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-charcoal/30 md:hidden" onClick={() => setSidebarOpen(false)} />
          )}
          <SideNav
            userName={userName}
            userInitials={userInitials}
            userRole={userRole}
            className={cn('md:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}
          />
          <main className={cn('flex-1 overflow-y-auto', 'pb-16')}>
            {showTopBar && <TopBar title={pageTitle} userName={userName} userInitials={userInitials} userRole={userRole} />}
            <div className="p-4 pt-2">
              {children}
            </div>
          </main>
        </div>
        {showBottomNav && <BottomNav />}
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-cream flex">
      <SideNav
        userName={userName}
        userInitials={userInitials}
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col min-w-0 ml-60">
        {showTopBar && <TopBar title={pageTitle} userName={userName} userInitials={userInitials} userRole={userRole} />}
        <main className="flex-1 overflow-y-auto flex">
          <div className="flex-1 p-6 pt-4">
            {children}
          </div>
          {rightSidebar && (
            <aside className="hidden lg:block w-72 shrink-0 p-6 pt-4 border-l border-warm-gray-lighter bg-cream/50">
              {rightSidebar}
            </aside>
          )}
        </main>
      </div>
    </div>
  )
}