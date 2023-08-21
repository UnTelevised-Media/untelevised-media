import type { NextApiRequest, NextApiResponse } from 'next';

export default function exit(req: NextApiRequest, res: NextApiResponse) {
  res.clearDraftMode();
  res.writeHead(307, { Location: '/' });
  res.end();
}


