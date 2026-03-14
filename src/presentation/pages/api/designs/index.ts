import type { NextApiRequest, NextApiResponse } from 'next'
import { DesignQueryService } from '@/application/services/DesignQueryService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const designQueryService = new DesignQueryService()

  if (req.method === 'GET') {
    const { modelId, published } = req.query

    if (modelId && typeof modelId === 'string') {
      const designs = published === 'true'
        ? await designQueryService.getByModelIdPublished(modelId)
        : await designQueryService.getByModelId(modelId)
      return res.status(200).json(designs)
    }

    const designs = published === 'true'
      ? await designQueryService.getPublished()
      : await designQueryService.getAll()

    return res.status(200).json(designs)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}


