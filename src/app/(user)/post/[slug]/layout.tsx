/* eslint-disable react/function-component-definition */
import '@/app/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/c/global/Header';
import Banner from '@/c/global/Banner';
import dynamic from 'next/dynamic';
import { draftMode } from 'next/headers';
import { token } from '@/l/sanity.fetch';
import { generateMetadata } from '@/u/generateMetadata';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = generateMetadata; 

const PreviewProvider = dynamic(() => import('@/components/PreviewProvider'));

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={` bg-slate-400/80  ${inter.className}`}>
        {draftMode().isEnabled ? (
          <PreviewProvider token={token}>
            <Header />
            <Banner />
            {children}
          </PreviewProvider>
        ) : (
          <>
            <Header />
            <Banner />
            {children}
          </>
        )}
      </body>
    </html>
  );
}
