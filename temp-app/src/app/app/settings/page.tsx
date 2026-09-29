'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Lock, Mail, Eye, Shield, Bell, Moon, Sun,
  Smartphone, Globe, Headphones, HelpCircle, LifeBuoy, Info,
  ChevronRight, ToggleLeft, ToggleRight, Menu, X
} from 'lucide-react'
import Link from 'next/link'
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

type SettingsItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: 'chevron' | 'toggle' | 'value'
  href?: string
  value?: string
  description?: string
  defaultChecked?: boolean
}

type SettingsSection = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: SettingsItem[]
}

const settingsSections: SettingsSection[] = [
  {
    id: 'account',
    label: 'Account',
    icon: User,
    items: [
      { id: 'edit-profile', label: 'Edit Profile', icon: User, action: 'chevron', href: '/app/profile' },
      { id: 'change-password', label: 'Change Password', icon: Lock, action: 'chevron' },
      { id: 'email', label: 'Email', icon: Mail, action: 'value', value: 'alex.kumar@email.com' },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: Shield,
    items: [
      { id: 'private-account', label: 'Private Account', icon: Eye, action: 'toggle', defaultChecked: false, description: 'Only approved followers can see your posts' },
      { id: 'show-online', label: 'Show Online Status', icon: Smartphone, action: 'toggle', defaultChecked: true, description: 'Let others see when you\'re active' },
      { id: 'blocked-users', label: 'Blocked Users', icon: User, action: 'chevron', description: 'Manage blocked accounts' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    items: [
      { id: 'push', label: 'Push Notifications', icon: Smartphone, action: 'toggle', defaultChecked: true, description: 'Receive notifications on your device' },
      { id: 'email-notifs', label: 'Email Notifications', icon: Mail, action: 'toggle', defaultChecked: false, description: 'Receive updates via email' },
      { id: 'quiet-hours', label: 'Quiet Hours', icon: Moon, action: 'chevron', description: 'Set hours to mute notifications' },
    ],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Sun,
    items: [
      { id: 'dark-mode', label: 'Dark Mode', icon: Moon, action: 'toggle', defaultChecked: false, description: 'Visual only — not functional yet' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    items: [
      { id: 'faq', label: 'FAQ', icon: HelpCircle, action: 'chevron', href: '/app/help/faq' },
      { id: 'support', label: 'Contact Support', icon: LifeBuoy, action: 'chevron', href: '/app/help/support' },
      { id: 'about', label: 'About', icon: Info, action: 'chevron' },
    ],
  },
]

export default function SettingsPage() {
  const [selectedSection, setSelectedSection] = useState('account')
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'private-account': false,
    'show-online': true,
    'push': true,
    'email-notifs': false,
    'dark-mode': false,
  })
  const isMobile = useIsMobile()
  const isDesktop = useIsDesktop()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleToggle = (id: string) => {
    setToggles(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-cream pb-safe">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mesh-gradient min-h-screen"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-cream/80 backdrop-blur-md border-b border-warm-gray-lighter">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-heading text-2xl font-bold text-charcoal"
              >
                Settings
              </motion.h1>
              {/* Mobile menu button */}
              {isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="glass-card p-2 rounded-xl"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6 text-charcoal" /> : <Menu className="w-6 h-6 text-charcoal" />}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {isDesktop ? (
            // Desktop: Two-column layout
            <div className="grid grid-cols-[260px_1fr] gap-6">
              {/* Left Navigation */}
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="sticky top-24"
              >
                <nav className="glass-card rounded-2xl p-3 space-y-1" role="navigation" aria-label="Settings sections">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setSelectedSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                        selectedSection === section.id
                          ? 'bg-white text-plum shadow-soft'
                          : 'text-warm-gray hover:text-charcoal hover:bg-cream-dark'
                      )}
                      role="tab"
                      aria-selected={selectedSection === section.id}
                    >
                      <section.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </motion.aside>

              {/* Right Content */}
              <motion.main
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                key={selectedSection}
                className="glass-card rounded-2xl p-6"
                role="tabpanel"
                aria-labelledby={`tab-${selectedSection}`}
              >
                <SectionContent
                  section={settingsSections.find(s => s.id === selectedSection)!}
                  toggles={toggles}
                  onToggle={handleToggle}
                />
              </motion.main>
            </div>
          ) : (
            // Mobile/Tablet: Single column with collapsible sections
            <div className="space-y-4">
              {settingsSections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: settingsSections.indexOf(section) * 0.05 }}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedSection(selectedSection === section.id ? '' : section.id)}
                    className="w-full flex items-center justify-between px-4 py-4 text-left"
                    aria-expanded={selectedSection === section.id}
                  >
                    <div className="flex items-center gap-3">
                      <section.icon className="w-5 h-5 text-plum" />
                      <span className="font-heading font-medium text-charcoal">{section.label}</span>
                    </div>
                    <ChevronRight
                      className={cn(
                        'w-5 h-5 text-warm-gray-light transition-transform',
                        selectedSection === section.id && 'rotate-90'
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {selectedSection === section.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-warm-gray-lighter px-4 pb-4"
                      >
                        <SectionContent
                          section={section}
                          toggles={toggles}
                          onToggle={handleToggle}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function SectionContent({ section, toggles, onToggle }: {
  section: SettingsSection
  toggles: Record<string, boolean>
  onToggle: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {section.items.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: section.items.indexOf(item) * 0.05 }}
          className={cn(
            'flex items-center justify-between px-4 py-4 rounded-xl',
            item.action === 'toggle' ? 'bg-cream-dark/50' : 'hover:bg-cream-dark/50'
          )}
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              item.action === 'toggle' ? 'bg-white border border-warm-gray-lighter' : 'bg-plum/10 text-plum'
            )}>
              <item.icon className={cn('w-5 h-5', item.action === 'toggle' ? 'text-warm-gray' : 'text-plum')} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-charcoal truncate">{item.label}</p>
              {item.description && (
                <p className="text-sm text-warm-gray mt-0.5 truncate">{item.description}</p>
              )}
              {item.value && (
                <p className="text-sm text-warm-gray mt-0.5 truncate">{item.value}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {item.action === 'toggle' && (
              <ToggleSwitch
                checked={toggles[item.id] ?? false}
                onChange={() => onToggle(item.id)}
                id={item.id}
              />
            )}
            {item.action === 'chevron' && (
              <Link
                href={item.href || '#'}
                className="flex items-center gap-2 text-warm-gray hover:text-plum transition-colors"
                aria-label={item.label}
              >
                <span className="text-sm font-medium">{item.value || 'Manage'}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
            {item.action === 'value' && !item.href && (
              <span className="text-sm text-warm-gray">{item.value}</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ToggleSwitch({ checked, onChange, id }: { checked: boolean; onChange: () => void; id: string }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={id}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-plum focus:ring-offset-2',
        checked ? 'bg-plum' : 'bg-warm-gray-lighter'
      )}
      aria-describedby={`${id}-desc`}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
        aria-hidden="true"
      />
    </button>
  )
}