import { scooters } from '@/config/scooters'
import DesignDetailClient from './DesignDetailClient'
import { notFound } from 'next/navigation'

interface DesignPageProps {
  params: {
    model: string
    slug: string
  }
}

export default function DesignPage({ params }: DesignPageProps) {
  const { model, slug } = params

  if (!model || !slug) {
    notFound()
  }

  // First, try to find design in config (for legacy designs)
  const scooter = (scooters as any)[model]
  const configDesign = scooter?.designs?.find((d: any) => d.id === slug)

  if (configDesign && scooter) {
    return (
      <DesignDetailClient scooter={scooter} design={configDesign} modelId={model} designId={slug} />
    )
  }

  // If not found, show 404
  notFound()
}
