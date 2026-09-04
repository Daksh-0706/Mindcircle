'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/landing')
  }, [router])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-heading text-3xl gradient-text font-bold">MindCircle</h1>
        <p className="text-warm-gray mt-2">Loading your safe space...</p>
      </div>
    </div>
  )
}
