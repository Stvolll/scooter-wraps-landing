'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'
import InstallationBooking from '@/components/InstallationBooking'

export default function BookingClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const model = searchParams.get('model') ?? ''
  const design = searchParams.get('design') ?? ''

  const modelLabel = useMemo(() => {
    if (!model) return ''
    const id = model.toLowerCase().replace(/\s+/g, '-')
    const names: Record<string, string> = {
      'honda-vision': 'Honda Vision',
      'honda-lead': 'Honda Lead',
      'honda-sh': 'Honda SH',
      'honda-pcx': 'Honda PCX',
      nvx: 'Yamaha NVX',
      'yamaha-nvx': 'Yamaha NVX',
    }
    return names[id] || model
  }, [model])

  const designLabel = useMemo(() => {
    if (!design) return ''
    return design.replace(/^[a-z]+-/, '').replace(/-/g, ' ')
  }, [design])

  return (
    <InstallationBooking
      onClose={() => router.back()}
      initialScooterModel={modelLabel || model}
      initialDesign={designLabel || design}
    />
  )
}
