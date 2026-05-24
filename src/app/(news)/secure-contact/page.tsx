/* eslint-disable react/function-component-definition */
// src/app/(user)/secure-contact/page.tsx
'use client';

import React, { useState } from 'react';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';
import { TurnstileWidget } from '@/components/global/TurnstileWidget';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';

export default function SecureContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    urgency: 'medium',
    contactMethod: 'email',
    isAnonymous: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { trackEvent } = useConsentAwareTracking();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/secure-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          ...(captchaToken ? { turnstileToken: captchaToken } : {}),
        }),
      });

      if (response.ok) {
        trackEvent('secure_contact_submitted', {
          urgency: formData.urgency,
          contact_method: formData.contactMethod,
          is_anonymous: formData.isAnonymous,
        });
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          urgency: 'medium',
          contactMethod: 'email',
          isAnonymous: false,
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-black text-slate-100'>
      {/* HERO SECTION */}
      <section className='border-b border-slate-800 bg-gradient-to-b from-slate-950 to-black py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                SECURE CONTACT
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>
          
          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-white md:text-5xl'>
              PROTECTED COMMUNICATION
            </h2>
            <p className='text-xl text-slate-300 leading-relaxed'>
              Need to share sensitive information? Use our secure contact form for protected communication 
              with our editorial team.
            </p>
          </div>
        </div>
      </section>

      {/* SECURITY FEATURES */}
      <section className='border-b border-slate-800 bg-slate-950 py-12'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='grid gap-8 md:grid-cols-3'>
            <div className='flex items-center space-x-4'>
              <div className='flex h-12 w-12 items-center justify-center bg-untele text-white'>
                <Shield className='h-6 w-6' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-white'>ENCRYPTED TRANSMISSION</h3>
                <p className='text-sm text-slate-400'>All data is encrypted in transit</p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex h-12 w-12 items-center justify-center bg-untele text-white'>
                <Lock className='h-6 w-6' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-white'>SECURE STORAGE</h3>
                <p className='text-sm text-slate-400'>Protected backend systems</p>
              </div>
            </div>

            <div className='flex items-center space-x-4'>
              <div className='flex h-12 w-12 items-center justify-center bg-untele text-white'>
                <Eye className='h-6 w-6' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-white'>EDITORIAL ONLY</h3>
                <p className='text-sm text-slate-400'>Accessed only by trusted staff</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section className='bg-black py-16'>
        <div className='mx-auto max-w-4xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                SECURE FORM
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>

          {submitStatus === 'success' && (
            <div className='mb-8 border border-green-500 bg-green-500/10 p-4 text-green-400'>
              <p className='font-bold'>Message sent securely!</p>
              <p className='text-sm'>We&rsquo;ll review your submission and respond if appropriate.</p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className='mb-8 border border-red-500 bg-red-500/10 p-4 text-red-400'>
              <p className='font-bold'>Error sending message.</p>
              <p className='text-sm'>Please try again or contact us directly.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Anonymous Option */}
            <div className='border border-slate-700 bg-slate-950 p-4'>
              <label className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  name='isAnonymous'
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  className='h-4 w-4 bg-slate-800 border-slate-600'
                />
                <span className='text-white font-bold'>Submit Anonymously</span>
              </label>
              <p className='mt-2 text-sm text-slate-400'>
                Check this box to submit without providing contact information
              </p>
            </div>

            {/* Name */}
            <div>
              <label htmlFor='name' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Name {formData.isAnonymous && '(Optional)'}
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                required={!formData.isAnonymous}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder={formData.isAnonymous ? 'Leave blank for anonymous' : 'Your name'}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor='email' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Email {formData.isAnonymous && '(Optional)'}
              </label>
              <input
                type='email'
                id='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                required={!formData.isAnonymous}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder={formData.isAnonymous ? 'Leave blank for anonymous' : 'your.email@example.com'}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor='phone' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Phone (Optional)
              </label>
              <input
                type='tel'
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder='Your phone number'
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor='subject' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Subject *
              </label>
              <input
                type='text'
                id='subject'
                name='subject'
                value={formData.subject}
                onChange={handleInputChange}
                required
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder='Brief subject line'
              />
            </div>

            {/* Urgency */}
            <div>
              <label htmlFor='urgency' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Urgency Level *
              </label>
              <select
                id='urgency'
                name='urgency'
                value={formData.urgency}
                onChange={handleInputChange}
                required
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
              >
                <option value='low'>Low - General inquiry</option>
                <option value='medium'>Medium - Important matter</option>
                <option value='high'>High - Urgent attention needed</option>
                <option value='critical'>Critical - Immediate response required</option>
              </select>
            </div>

            {/* Contact Method */}
            <div>
              <label htmlFor='contactMethod' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Preferred Contact Method
              </label>
              <select
                id='contactMethod'
                name='contactMethod'
                value={formData.contactMethod}
                onChange={handleInputChange}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
              >
                <option value='email'>Email</option>
                <option value='phone'>Phone</option>
                <option value='secure'>Secure Messaging</option>
                <option value='none'>Do Not Contact (Information Only)</option>
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor='message' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Message *
              </label>
              <textarea
                id='message'
                name='message'
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={8}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder='Your secure message...'
              />
            </div>

            {/* Warning */}
            <div className='border border-yellow-500 bg-yellow-500/10 p-4'>
              <div className='flex items-start space-x-3'>
                <AlertTriangle className='h-5 w-5 text-yellow-500 mt-0.5' />
                <div>
                  <p className='text-yellow-400 font-bold'>Security Notice</p>
                  <p className='text-sm text-yellow-300'>
                    While this form is secure, for maximum protection of sensitive information, 
                    consider using our whistleblower portal or encrypted communication methods.
                  </p>
                </div>
              </div>
            </div>

            <TurnstileWidget
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'SENDING SECURELY...' : 'SEND SECURE MESSAGE'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
