'use client'
import { useState } from 'react'
import { AppNav } from '../../../../components/layout/AppNavContext'
import Card from '../../../../components/ui/Card'
import Button from '../../../../components/ui/Button'
export default function SupportPage(){const [sent,setSent]=useState(false);return <><AppNav title="Contact support" showBack/><div className="page-enter mx-auto max-w-2xl pb-8"><Card className="bg-white/80" padding="lg"><h1 className="font-heading text-3xl font-semibold">We&apos;re here to listen.</h1><p className="mt-2 text-sm leading-6 text-warm-gray">Tell us what&apos;s happening and our team will get back to you as soon as possible.</p>{sent?<p className="mt-8 rounded-xl bg-sage/10 p-4 text-sm text-sage-dark">Your message has been sent. We&apos;ll be in touch soon.</p>:<><input placeholder="Subject" className="input-warm mt-8 w-full"/><textarea placeholder="How can we help?" className="input-warm mt-3 min-h-40 w-full resize-none"/><Button className="mt-5" onClick={()=>setSent(true)}>Send message</Button></>}</Card></div></>}
