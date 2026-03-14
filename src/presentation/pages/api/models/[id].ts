import type { NextApiRequest, NextApiResponse } from 'next'
import { ModelService } from '@/application'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid model ID' })
  }

  const modelService = new ModelService()

  if (req.method === 'GET') {
    const model = await modelService.getById(id)
    if (!model) {
      return res.status(404).json({ error: 'Model not found' })
    }
    return res.status(200).json(model)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}


