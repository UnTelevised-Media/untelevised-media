import { Alex_Brush } from 'next/font/google';
import localFont from 'next/font/local';
export const headerFontStyle = Alex_Brush({
  subsets: ['latin'],
  variable: '--my-font-family',
  weight: '400',
});

export const Aerotis = localFont({
  //   subsets: ['latin'],
  src: '/../../../public/AEROTIS.ttf',
  weight: '400',
});
