// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Sign Up | UnTelevised Media',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12'>
      {/* Background gradients */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black' />
        <div className='absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-untele/5 blur-[120px]' />
        <div className='absolute right-1/4 top-1/2 h-[400px] w-[400px] -translate-y-1/2 translate-x-1/2 rounded-full bg-slate-700/20 blur-[100px]' />
      </div>

      {/* Card */}
      <div className='relative z-10 flex w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-sm'>

        {/* LEFT — branding */}
        <div className='relative hidden flex-col items-center justify-center gap-8 bg-slate-950/60 px-12 py-16 md:flex md:w-1/2'>
          <div className='absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-untele/20 blur-[80px]' />

          <div className='relative z-10 flex flex-col items-center gap-6'>
            <div className='relative'>
              <div className='absolute inset-0 rounded-full bg-untele/30 blur-2xl' />
              <Image
                src='/Logo.png'
                alt='UnTelevised Media'
                width={140}
                height={140}
                className='relative drop-shadow-2xl'
              />
            </div>

            <div className='text-center'>
              <p className='text-3xl font-black tracking-tight text-white'>
                <span className='text-untele'>Un</span>Televised
              </p>
              <p className='mt-1 text-lg font-bold uppercase tracking-widest text-slate-400'>
                Media
              </p>
            </div>

            <p className='max-w-xs text-center text-sm leading-relaxed text-slate-400'>
              Unfiltered. Uncensored. Uncompromising.
              <br />
              Independent journalism that goes where corporate press won&rsquo;t.
            </p>

            <div className='flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-sm text-slate-300'>
              <span className='h-1.5 w-1.5 rounded-full bg-untele' />
              Create your account
            </div>
          </div>
        </div>

        {/* RIGHT — Clerk sign-up */}
        <div className='flex w-full flex-col items-center justify-center px-8 py-12 md:w-1/2'>
          <SignUp
            appearance={{
              variables: {
                colorPrimary: '#D70606',
                colorBackground: '#0f172a',
                colorInputBackground: '#1e293b',
                colorInputText: '#f1f5f9',
                colorText: '#f1f5f9',
                colorTextSecondary: '#94a3b8',
                borderRadius: '4px',
                fontFamily: 'inherit',
                fontSize: '14px',
                spacingUnit: '18px',
              },
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none bg-transparent w-full',
                cardBox: 'w-full',
                headerTitle: 'text-white font-black text-xl',
                headerSubtitle: 'text-slate-400 text-sm',
                logoBox: 'hidden',
                formButtonPrimary:
                  'bg-untele hover:bg-red-700 text-white font-black uppercase tracking-widest text-xs rounded transition-colors',
                formFieldInput:
                  'bg-slate-800 border border-slate-700 text-white focus:border-untele focus:ring-0 rounded',
                formFieldLabel: 'text-slate-300 text-xs font-bold',
                footerActionLink: 'text-untele hover:text-red-400 font-semibold',
                footerActionText: 'text-slate-400 text-xs',
                dividerLine: 'bg-slate-700',
                dividerText: 'text-slate-500 text-xs',
                socialButtonsBlockButton:
                  'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded transition-colors',
                socialButtonsBlockButtonText: 'text-slate-300 font-medium text-sm',
                alertText: 'text-red-400 text-xs',
                formFieldErrorText: 'text-red-400 text-xs',
                internalLink: 'text-untele hover:text-red-400',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
