import type { NextApiRequest, NextApiResponse } from 'next';


export default function preview(req: NextApiRequest, res: NextApiResponse) {
    res.setDraftMode({ options: { enabled: true}});
    res.writeHead(307, { Location: '/' });
    res.end();
}

