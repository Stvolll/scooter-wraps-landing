import { useState, useEffect } from 'react'
import { DesignService } from '@/application'
import type { Design } from '@/domain'
import type { DesignId } from '@/shared-core'

export function useDesign(designId: DesignId) {
  const [design, setDesign] = useState<Design | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const designService = new DesignService()
    designService
      .getById(designId)
      .then((d) => {
        setDesign(d)
        setLoading(false)
      })
      .catch((e) => {
        setError(e)
        setLoading(false)
      })
  }, [designId])

  return { design, loading, error }
}


