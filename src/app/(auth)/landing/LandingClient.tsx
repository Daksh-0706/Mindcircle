'use client'

import { useState, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Menu,
  X,
  Lock,
  TrendingUp,
  Users,
  Compass,
  Stethoscope,
  Phone,
  ArrowRight,
  ChevronRight,
  Heart,
  BookOpen,
  Mail,
  MapPin,
} from 'lucide-react'
import { FEATURES } from '../../../lib/constants'
import { StickyMobileCta } from '@/components/common/StickyMobileCta'
import { CONTACT } from '@/lib/seo'
import { Logo } from '../../../components/common/Logo'

/* ── Helpers ──────────────────────────────────────────────── */

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

const iconMap: Record<string, ReactNode> = {
  Lock: <Lock className="w-6 h-6" />,
  TrendingUp: <TrendingUp className="w-6 h-6" />,
  Users: <Users className="w-6 h-6" />,
  Compass: <Compass className="w-6 h-6" />,
  Stethoscope: <Stethoscope className="w-6 h-6" />,
  Phone: <Phone className="w-6 h-6" />,
}

/* ── Floating Orb ─────────────────────────────────────────── */

function FloatingOrb({
  className,
  delay = 0,
}: {
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      className={`absolute rounded-full blob-shape ${className}`}
      animate={{
        y: [0, -18, 8, -10, 0],
        x: [0, 10, -6, 12, 0],
        scale: [1, 1.05, 0.97, 1.03, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  )
}

/* ── Navbar ───────────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
  ]

  const moreLinks = [
    { label: 'About', href: '/app/help/about' },
    { label: 'Support', href: '/app/crisis' },
    { label: 'Contact Us', href: '/app/help/support' },
  ]

  const navLinkClass =
    'text-sm font-medium text-charcoal/70 hover:text-plum transition-colors'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-card shadow-medium' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Logo height={32} withWordmark />
            
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </a>
            ))}
            {moreLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link
              href="/signup"
              className="px-6 py-2.5 rounded-full text-sm font-semibold inline-block bg-plum text-white shadow-medium hover:bg-plum-dark transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-charcoal"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="md:hidden bg-white/95 backdrop-blur-md border-t border-warm-gray/20 shadow-medium"
        >
          <div className="px-4 py-6 space-y-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-base font-medium text-charcoal/80 hover:text-plum transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {moreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-base font-medium text-charcoal/80 hover:text-plum transition-colors py-2"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/signup"
              className="block text-center py-3 rounded-xl text-sm font-semibold mt-4 bg-plum text-white shadow-medium hover:bg-plum-dark transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  )
}

/* ── Hero Section ─────────────────────────────────────────── */

function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center mesh-gradient overflow-hidden pt-20"
    >
      {/* Floating orbs */}
      <FloatingOrb
        className="w-64 h-64 bg-sage/15 -top-20 -left-20"
        delay={0}
      />
      <FloatingOrb
        className="w-48 h-48 bg-terracotta/12 top-1/3 right-1/4"
        delay={2}
      />
      <FloatingOrb
        className="w-56 h-56 bg-plum/10 bottom-10 left-1/3"
        delay={4}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="gradient-text">Your Safe Space</span>
              <br />
              <span className="text-charcoal">for Mental Wellness</span>
            </h1>
            <p className="mt-6 text-lg text-warm-gray max-w-lg leading-relaxed">
              Journal privately, track your moods, and connect with a community
              that understands. Your journey to wellness starts here.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="btn-gradient px-8 py-3.5 rounded-full font-semibold text-base inline-flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-3.5 rounded-full font-semibold text-base border-2 border-plum/20 text-plum hover:bg-plum/5 transition-colors inline-flex items-center gap-2"
              >
                Learn More <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Right: abstract SVG decoration (desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex items-center justify-center"
          >
            <div className="relative w-96 h-96">
              {/* Decorative circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 rounded-full border-2 border-plum/15 animate-[spin_20s_linear_infinite]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-52 h-52 rounded-full border-2 border-terracotta/15 animate-[spin_15s_linear_infinite_reverse]" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-plum/20 to-terracotta/20 blob-shape" />
              </div>
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Logo height={80} />
              </div>
              {/* Floating mini elements */}
              <motion.div
                className="absolute top-8 right-12 w-12 h-12 rounded-xl glass-card flex items-center justify-center"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <BookOpen className="w-5 h-5 text-plum" />
              </motion.div>
              <motion.div
                className="absolute bottom-12 left-8 w-12 h-12 rounded-xl glass-card flex items-center justify-center"
                animate={{ y: [0, 8, 0] }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
              >
                <Users className="w-5 h-5 text-sage" />
              </motion.div>
              <motion.div
                className="absolute top-1/2 right-0 w-10 h-10 rounded-lg glass-card flex items-center justify-center"
                animate={{ y: [0, -6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              >
                <Compass className="w-4 h-4 text-terracotta" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ── Features Section ─────────────────────────────────────── */

function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal">
            Everything You Need to{' '}
            <span className="gradient-text">Thrive</span>
          </h2>
          <p className="mt-4 text-warm-gray max-w-2xl mx-auto text-lg">
            A complete toolkit designed to support your mental wellness journey,
            from journaling to community support.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:shadow-medium transition-shadow"
            >
              {/* Left border gradient accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-plum to-terracotta rounded-l-2xl" />
              <div className="pl-4">
                <div className="w-12 h-12 rounded-xl bg-plum/10 flex items-center justify-center text-plum mb-4 group-hover:bg-plum group-hover:text-cream transition-colors">
                  {iconMap[feature.icon] || <Heart className="w-6 h-6" />}
                </div>
                <h3 className="font-heading text-lg font-semibold text-charcoal mb-2">
                  {feature.title}
                </h3>
                <p className="text-warm-gray text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── How It Works Section ─────────────────────────────────── */

function HowItWorksSection() {
  const steps = [
    {
      num: 1,
      title: 'Sign Up',
      desc: 'Create your anonymous account in seconds. No personal data required.',
    },
    {
      num: 2,
      title: 'Start Journaling',
      desc: 'Write freely, track your moods, and explore guided activities.',
    },
    {
      num: 3,
      title: 'Grow Together',
      desc: 'Connect with peers, join support rooms, and access professional help.',
    },
  ]

  return (
    <section
      id="how-it-works"
      className="py-24 px-4 sm:px-6 lg:px-8 mesh-gradient"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="mt-4 text-warm-gray max-w-xl mx-auto text-lg">
            Getting started is simple and takes less than a minute.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-gradient-to-r from-plum/30 via-terracotta/30 to-sage/30" />

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-plum to-terracotta text-cream font-heading text-xl font-bold shadow-medium mx-auto mb-6">
                  {step.num}
                </div>
                <h3 className="font-heading text-xl font-semibold text-charcoal mb-3">
                  {step.title}
                </h3>
                <p className="text-warm-gray text-sm leading-relaxed max-w-xs mx-auto">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CTA Section ──────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto mesh-gradient rounded-3xl py-16 px-8 text-center relative overflow-hidden"
      >
        {/* Decorative orbs */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-plum/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-terracotta/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-charcoal mb-4">
            Ready to Start Your{' '}
            <span className="gradient-text">Journey</span>?
          </h2>
          <p className="text-warm-gray text-lg max-w-lg mx-auto mb-8">
            A private place to journal, notice your moods, and find people who
            understand — built for students and young professionals.
          </p>
          <Link
            href="/signup"
            className="btn-gradient px-10 py-4 rounded-full font-semibold text-base inline-flex items-center gap-2"
          >
            Join MindCircle Today <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="bg-plum-dark text-cream/80 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo height={32} withWordmark />
              
            </div>
            <p className="text-sm leading-relaxed text-cream/60 max-w-xs">
              A privacy-first mental health platform designed for students and
              young professionals. Your safe space for growth.
            </p>
          </div>

          {/* Features column */}
          <div>
            <h4 className="font-heading font-semibold text-cream mb-4">
              Features
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-cream transition-colors">
                  Private Journaling
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-cream transition-colors">
                  Mood Tracking
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-cream transition-colors">
                  Peer Support
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-cream transition-colors">
                  Guided Activities
                </a>
              </li>
            </ul>
          </div>

          {/* Support column */}
          <div>
            <h4 className="font-heading font-semibold text-cream mb-4">
              Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/app/help/faq"
                  className="hover:text-cream transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/app/help/support"
                  className="hover:text-cream transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-cream transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-cream transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/app/crisis"
                  className="hover:text-cream transition-colors"
                >
                  Crisis Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect column */}
          <div>
            <h4 className="font-heading font-semibold text-cream mb-4">
              Connect
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center gap-2 hover:text-cream transition-colors break-all"
                >
                  <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2 text-cream/60">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  {CONTACT.address}
                  <br />
                  <span className="text-xs text-cream/40">{CONTACT.hours}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/50">
          <p>&copy; {new Date().getFullYear()} MindCircle. All rights reserved.</p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:text-cream transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-cream transition-colors">
              Privacy
            </Link>
            <Link href="/app/help/about" className="hover:text-cream transition-colors">
              About
            </Link>
            <Link href="/app/help/support" className="hover:text-cream transition-colors">
              Support
            </Link>
            <span>Made with care for mental wellness.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ─────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <motion.div
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
        <Footer />
      </motion.div>
      <StickyMobileCta />
    </>
  )
}
