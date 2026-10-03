'use client'

import { useEffect, useState } from 'react'
import {
  Bell, ChevronRight, Eye, HelpCircle, Info, LifeBuoy, Lock, Mail,
  Moon, Shield, Smartphone, Sparkles, Sun, User,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '../../../lib/utils'

type SettingItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  action: 'toggle' | 'chevron' | 'value'
  href?: string
  description?: string
  iconBg?: string
  iconColor?: string
}

type SettingsSection = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  iconBg?: string
  /** decorative blobs at the top-right of the card */
  decor?: boolean
  items: SettingItem[]
}

const settingsSections: SettingsSection[] = [
  {
    id: 'account',
    label: 'Account',
    icon: User,
    items: [
      { id: 'edit-profile', label: 'Edit Profile', icon: User, action: 'chevron', href: '/app/settings/edit-profile', iconBg: 'bg-[#EFEAFB]', iconColor: 'text-[#6B4A80]' },
      {
        id: 'profile-setup',
        label: 'Profile Setup',
        // The 4-step setup is a standalone route with no gate, so this is a
        // plain link: it works whether the setup was finished, skipped, or
        // never shown at all.
        icon: Sparkles,
        action: 'chevron',
        href: '/onboarding',
        description: 'Revisit the 4-step setup — interests, goals and visibility.',
        iconBg: 'bg-[#EAF3EA]',
        iconColor: 'text-[#5F7F52]',
      },
      { id: 'change-password', label: 'Change Password', icon: Lock, action: 'chevron', href: '/app/settings/change-password', iconBg: 'bg-[#FBE7EC]', iconColor: 'text-[#A34A6B]' },
      { id: 'email', label: 'Email', icon: Mail, action: 'value', iconBg: 'bg-[#EFEAFB]', iconColor: 'text-[#6B4A80]' },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: Shield,
    items: [
      { id: 'private-account', label: 'Private Account', icon: Eye, action: 'toggle', description: 'Only approved followers can see your content.', iconBg: 'bg-[#FBEEDC]', iconColor: 'text-[#D08A3E]' },
      { id: 'show-online', label: 'Show Online Status', icon: Smartphone, action: 'toggle', description: "Let others see when you're active.", iconBg: 'bg-[#EFEAFB]', iconColor: 'text-[#6B4A80]' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    decor: true,
    items: [
      { id: 'push', label: 'Push Notifications', icon: Smartphone, action: 'toggle', description: 'Receive notifications on your device.', iconBg: 'bg-[#FDF0F4]', iconColor: 'text-[#A34A6B]' },
      { id: 'email-notifs', label: 'Email Notifications', icon: Mail, action: 'toggle', description: 'Receive updates via email.', iconBg: 'bg-[#FBE7EC]', iconColor: 'text-[#A34A6B]' },
    ],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Sun,
    decor: true,
    items: [
      { id: 'dark-mode', label: 'Dark Mode', icon: Moon, action: 'toggle', description: 'Visual only — not functional settings.', iconBg: 'bg-[#FBEEDC]', iconColor: 'text-[#D08A3E]' },
    ],
  },
  {
    id: 'help',
    label: 'Help',
    icon: HelpCircle,
    decor: true,
    items: [
      { id: 'faq', label: 'FAQ', icon: HelpCircle, action: 'chevron', href: '/app/help/faq', iconBg: 'bg-[#EFEAFB]', iconColor: 'text-[#6B4A80]' },
      { id: 'support', label: 'Contact Support', icon: LifeBuoy, action: 'chevron', href: '/app/help/support', iconBg: 'bg-[#FBE7EC]', iconColor: 'text-[#A34A6B]' },
      { id: 'about', label: 'About', icon: Info, action: 'chevron', href: '/app/help/about', iconBg: 'bg-[#EFEAFB]', iconColor: 'text-[#6B4A80]' },
    ],
  },
]

/** Toggle styled like the mockup: plum when on, beige when off, big white knob. */
function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn(
        'relative inline-flex h-10 w-[72px] shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-plum/40 focus:ring-offset-2',
        on ? 'bg-[#3D2060]' : 'bg-[#E5D9CE]',
      )}
    >
      <span
        className={cn(
          'inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform',
          on ? 'translate-x-[34px]' : 'translate-x-1',
        )}
      />
    </button>
  )
}

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
    <>
    <div className="relative min-h-screen bg-[#FBF3EA] pb-safe">
      {/* soft page blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#EFDFF3]/60 blur-2xl" />
        <div className="absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-[#F6DFCB]/60 blur-2xl" />
        <div className="absolute -left-16 bottom-10 h-64 w-64 rounded-full bg-[#E4D9F5]/50 blur-2xl" />
      </div>

      <div className="page-enter relative mx-auto max-w-3xl space-y-5 py-2">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden rounded-b-[28px] px-2 pb-4 pt-6">
          {/* leaf illustration top-right */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/settings-leaves.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-6 h-56 w-auto object-contain sm:h-64"
          />
          <div className="relative max-w-[65%]">
            <h1 className="font-heading text-[46px] font-bold leading-none text-[#3D2060]">Settings</h1>
            <svg width="150" height="12" viewBox="0 0 150 12" className="mt-2" aria-hidden="true">
              <path d="M2 7 Q 24 2, 46 6 T 90 6 T 146 5" fill="none" stroke="#E08A54" strokeWidth="4" strokeLinecap="round" />
            </svg>
            <p className="mt-4 max-w-xs text-[18px] leading-7 text-charcoal/75">
              Manage your account, privacy and preferences.
            </p>
          </div>
          {savingPrefs && <p className="relative mt-2 text-right text-xs text-warm-gray">Saving preferences…</p>}
        </section>

        {/* ── Section cards ────────────────────────────────────── */}
        {settingsSections.map((section) => (
          <section
            key={section.id}
            className="relative overflow-hidden rounded-[24px] border border-white/80 bg-white/75 shadow-[0_4px_18px_rgba(74,44,94,0.06)] backdrop-blur-sm"
          >
            {/* inner decor blobs top-right */}
            {section.decor && (
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#EFE3F6]/70 blur-md" />
                <div className="absolute right-10 -top-6 h-20 w-24 rounded-full bg-[#F8E3D3]/80 blur-sm" />
                {/* leaf accents */}
                <Leaf className="absolute right-4 top-4 h-7 w-7 rotate-[25deg] text-[#9BB89C]/70" />
                <Leaf className="absolute right-14 top-12 h-5 w-5 rotate-[60deg] text-[#B7A7DB]/60" />
              </div>
            )}

            <div className="relative px-6 pb-5 pt-5">
              {/* section header */}
              <div className="mb-4 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFEAFB] text-[#4A2C6E] shadow-[0_2px_8px_rgba(74,44,94,0.08)]">
                  <section.icon size={24} />
                </span>
                <h2 className="font-heading text-[24px] font-bold text-[#3D2060]">{section.label}</h2>
              </div>

              {/* items */}
              <div className="space-y-2.5">
                {section.items.map((item) => {
                  const rowContent = (
                    <>
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <span className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
                          item.iconBg ?? 'bg-[#EFEAFB]',
                          item.iconColor ?? 'text-[#6B4A80]',
                        )}>
                          <item.icon size={21} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[17px] font-semibold text-charcoal">{item.label}</p>
                          {(item.description || item.id === 'email') && (
                            <p className="mt-0.5 truncate text-[14.5px] leading-6 text-warm-gray">
                              {item.id === 'email' ? (email || 'Loading…') : item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.action === 'toggle' && (
                        <Toggle on={toggles[item.id] ?? false} onClick={() => handleToggle(item.id)} label={item.label} />
                      )}
                      {item.action === 'chevron' && item.href && (
                        <ChevronRight className="h-5 w-5 shrink-0 text-charcoal/60" />
                      )}
                    </>
                  )

                  // Chevron rows: whole bar is a link. Others: plain row.
                  if (item.action === 'chevron' && item.href) {
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className="flex items-center justify-between gap-3 rounded-[18px] bg-[#F7F1FB]/70 px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:bg-[#F1E9F8]/80"
                        aria-label={item.label}
                      >
                        {rowContent}
                      </Link>
                    )
                  }
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-[18px] bg-[#F7F1FB]/70 px-4 py-3.5"
                    >
                      {rowContent}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
    </>
  )
}

function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8Z" />
    </svg>
  )
}
