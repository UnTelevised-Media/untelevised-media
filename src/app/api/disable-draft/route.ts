/* eslint-disable import/prefer-default-export */

import { draftMode } from 'next/headers';
import type { NextApiResponse } from 'next';

export async function GET(req: any, res: NextApiResponse) {
  // Disable draft mode
  draftMode().disable();

  const url = new URL(req.url || '');

  // Corrected line
  if (url.origin) {
    res.redirect(new URL('/', url.origin).toString());
  }
}
