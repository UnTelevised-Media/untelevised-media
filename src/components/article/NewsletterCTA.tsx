'use client';

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

export default function NewsletterCTA() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      setStatus('error');
      setMessage('Please agree to the terms');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: name,
          email,
          list: 'news',
          source: 'article_sidebar',
          gdprConsent: true,
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Check your email to confirm!');
        setName('');
        setEmail('');
        setAgreed(false);
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className='flex flex-col border border-slate-300 bg-gradient-to-br from-slate-50 to-white p-6 dark:border-slate-700 dark:from-slate-950 dark:to-black'>
      <div className='mb-4 flex h-10 w-10 items-center justify-center bg-untele text-sm text-white'>
        <Mail className='h-5 w-5' />
      </div>

      <h3 className='mb-1 text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white'>
        Stay Updated
      </h3>
      <p className='mb-4 text-xs text-slate-600 dark:text-slate-400'>
        Get stories that matter, straight to your inbox.
      </p>

      {status === 'success' ? (
        <div className='flex items-center gap-2 text-xs font-semibold text-green-600'>
          <CheckCircle className='h-4 w-4' />
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
          <input
            type='text'
            placeholder='Your name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='border border-slate-300 bg-white px-3 py-2 text-xs placeholder-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400'
          />

          <input
            type='email'
            placeholder='your@email.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className='border border-slate-300 bg-white px-3 py-2 text-xs placeholder-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-400'
          />

          <label className='flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400'>
            <input
              type='checkbox'
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className='mt-0.5'
            />
            <span>
              I agree to receive updates and respect your{' '}
              <a href='/privacy-policy' className='underline hover:text-untele'>
                privacy policy
              </a>
            </span>
          </label>

          <button
            type='submit'
            disabled={status === 'loading'}
            className='bg-untele px-3 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:opacity-50'
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>

          {status === 'error' && (
            <div className='flex items-center gap-2 text-xs font-semibold text-red-600'>
              <AlertCircle className='h-4 w-4' />
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
