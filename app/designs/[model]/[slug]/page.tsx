'use client'

import { useParams } from 'next/navigation'
import { scooters } from '@/config/scooters'
import DesignDetailClient from './DesignDetailClient'
import { notFound } from 'next/navigation'

export default function DesignPage() {
  const params = useParams()
  const model = params?.model as string
  const slug = params?.slug as string

  // Debug logging
  if (typeof window !== 'undefined') {
    console.log('DesignPage params:', { model, slug })
    console.log('Available models:', Object.keys(scooters))
    if (model) {
      console.log('Scooter config:', (scooters as any)[model])
    }
  }

  if (!model || !slug) {
    notFound()
  }

  // First, try to find design in config (for legacy designs)
  const scooter = (scooters as any)[model]
  const configDesign = scooter?.designs?.find((d: any) => d.id === slug)

  if (typeof window !== 'undefined') {
    console.log('Found scooter:', !!scooter)
    console.log('Found design:', !!configDesign)
    if (configDesign) {
      console.log('Design details:', configDesign)
    }
  }

  if (configDesign && scooter) {
    return (
      <DesignDetailClient scooter={scooter} design={configDesign} modelId={model} designId={slug} />
    )
  }

  // If not found, show 404
  notFound()
}
