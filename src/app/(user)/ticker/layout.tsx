/* eslint-disable react/function-component-definition */
import '@/app/globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title:
    'UnTelevised Media - Breaking News Ticker ',
  description: 'The Revolution will be UnTelevised',

};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`bg-slate-400/70 scrollbar-hide ${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
