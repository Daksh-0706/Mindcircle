'use client'

import { useEffect, useState } from 'react'
import {
  Bell, ChevronRight, Eye, HelpCircle, Info, LifeBuoy, Lock, Mail,
  Moon, Shield, Smartphone, Sun, User,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '../../../lib/utils'

type SettingItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: 'toggle' | 'chevron' | 'value'
  href?: string
  description?: string
}

type SettingsSection = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: SettingItem[]
}

const settingsSections: SettingsSection[] = [
  {
    id: 'account',
    label: 'Account',
    icon: User,
    items: [
      { id: 'edit-profile', label: 'Edit Profile', icon: User, action: 'chevron', href: '/app/profile' },
      { id: 'change-password', label: 'Change Password', icon: Lock, action: 'chevron' },
      { id: 'email', label: 'Email', icon: Mail, action: 'value' },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: Shield,
    items: [
      { id: 'private-account', label: 'Private Account', icon: Eye, action: 'toggle', description: 'Only approved followers can see your posts' },
      { id: 'show-online', label: 'Show Online Status', icon: Smartphone, action: 'toggle', description: "Let others see when you're active" },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    items: [
      { id: 'push', label: 'Push Notifications', icon: Smartphone, action: 'toggle', description: 'Receive notifications on your device' },
      { id: 'email-notifs', label: 'Email Notifications', icon: Mail, action: 'toggle', description: 'Receive updates via email' },
    ],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Sun,
    items: [
      { id: 'dark-mode', label: 'Dark Mode', icon: Moon, action: 'toggle', description: 'Visual only — not functional yet' },
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
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'private-account': false,
    'show-online': true,
    'push': true,
    'email-notifs': false,
    'dark-mode': false,
  })
  const [email, setEmail] = useState('')
  const [savingPrefs, setSavingPrefs] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/api/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!active || !json) return
        setEmail(json.user?.email ?? '')
        const saved = json.profile?.settings
        if (saved && typeof saved === 'object' && saved.notification_toggles) {
          setToggles((prev) => ({ ...prev, ...(saved.notification_toggles as Record<string, boolean>) }))
        }
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  const handleToggle = (id: string) => {
    setToggles((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      setSavingPrefs(true)
      fetch('/api/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { notification_toggles: next } }),
      })
        .catch(() => undefined)
        .finally(() => setSavingPrefs(false))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-cream pb-safe">
      <div className="page-enter mx-auto max-w-3xl space-y-4 py-2">
        <h1 className="font-heading text-[32px] font-bold text-plum">Settings</h1>
        {savingPrefs && <p className="text-right text-xs text-warm-gray">Saving preferences…</p>}

        {settingsSections.map((section) => (
          <section key={section.id} className="rounded-[20px] border border-warm-gray-lighter bg-white p-2">
            <div className="flex items-center gap-3 px-4 pb-1 pt-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-plum/10 text-plum">
                <section.icon className="h-4.5 w-4.5" />
              </span>
              <h2 className="font-heading text-base font-bold text-plum">{section.label}</h2>
            </div>
            <div className="space-y-1 p-2">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-xl px-4 py-3.5',
                    item.action === 'toggle' ? 'bg-cream-dark/40' : 'hover:bg-cream-dark/50',
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      item.action === 'toggle' ? 'border border-warm-gray-lighter bg-white text-warm-gray' : 'bg-plum/10 text-plum',
                    )}>
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-charcoal">{item.label}</p>
                      {item.description && <p className="mt-0.5 truncate text-sm text-warm-gray">{item.description}</p>}
                      {item.id === 'email' && <p className="mt-0.5 truncate text-sm text-warm-gray">{email || 'Loading…'}</p>}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {item.action === 'toggle' && (
                      <button
                        onClick={() => handleToggle(item.id)}
                        role="switch"
                        aria-checked={toggles[item.id] ?? false}
                        aria-label={item.label}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-plum focus:ring-offset-2',
                          toggles[item.id] ? 'bg-plum' : 'bg-warm-gray-lighter',
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                          toggles[item.id] ? 'translate-x-6' : 'translate-x-1',
                        )} />
                      </button>
                    )}
                    {item.action === 'chevron' && item.href && (
                      <Link href={item.href} className="flex items-center gap-2 text-warm-gray transition-colors hover:text-plum" aria-label={item.label}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
