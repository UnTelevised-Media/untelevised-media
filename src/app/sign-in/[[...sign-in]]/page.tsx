// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | UnTelevised Media',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-black px-4'>
      {/* Brand header */}
      <div className='mb-8 flex items-center gap-4'>
        <div className='bg-untele px-4 py-2'>
          <span className='text-xl font-black uppercase tracking-widest text-white'>
            UNTELEVISED
          </span>
        </div>
        <span className='text-sm font-bold uppercase tracking-widest text-slate-500'>
          Admin Access
        </span>
      </div>

      <SignIn
        appearance={{
          variables: {
            colorPrimary: '#D70606',
            colorBackground: '#000000',
            colorInputBackground: '#0f172a',
            colorInputText: '#f1f5f9',
            colorText: '#f1f5f9',
            colorTextSecondary: '#94a3b8',
            borderRadius: '0px',
            fontFamily: 'inherit',
          },
          elements: {
            card: 'shadow-none border border-slate-800 bg-black',
            headerTitle: 'text-white font-black uppercase tracking-widest',
            headerSubtitle: 'text-slate-400',
            formButtonPrimary:
              'bg-[#D70606] hover:bg-red-700 text-white font-black uppercase tracking-widest rounded-none text-xs',
            formFieldInput:
              'bg-slate-900 border border-slate-700 text-white focus:border-[#D70606] rounded-none',
            formFieldLabel: 'text-slate-300 text-xs font-bold uppercase tracking-widest',
            footerActionLink: 'text-[#D70606] hover:text-red-400',
            identityPreviewEditButton: 'text-[#D70606]',
            dividerLine: 'bg-slate-800',
            dividerText: 'text-slate-500',
            socialButtonsBlockButton:
              'border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 rounded-none',
          },
        }}
      />
    </div>
  );
}
