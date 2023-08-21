/* eslint-disable import/prefer-default-export */
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextApiRequest } from 'next';

export async function GET(req: NextApiRequest) {
  // Disable draft mode
  draftMode().disable();

  // Redirect to root path
  redirect('/');
}