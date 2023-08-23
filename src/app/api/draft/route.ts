/* eslint-disable import/prefer-default-export */
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  // Enable draft mode
  draftMode().enable();

  // Redirect to root path
  redirect('/');
}
