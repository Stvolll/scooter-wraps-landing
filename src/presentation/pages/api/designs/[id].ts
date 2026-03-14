import type { NextApiRequest, NextApiResponse } from 'next'
import { DesignService } from '@/application'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid design ID' })
  }

  const designService = new DesignService()

  if (req.method === 'GET') {
    const design = await designService.getById(id)
    if (!design) {
      return res.status(404).json({ error: 'Design not found' })
    }
    return res.status(200).json(design)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}


