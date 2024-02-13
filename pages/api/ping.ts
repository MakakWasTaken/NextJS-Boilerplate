import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    return res.json({ ok: true, message: 'Pong' })
  }
  throw new Error(`HTTP ${req.method} method is not supported at this route.`)
}
