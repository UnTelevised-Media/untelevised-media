'use client';
// src/components/careers/ApplicationForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobApplicationSchema, type JobApplicationFormData } from '@/lib/validations/jobApplicationSchema';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { TurnstileWidget } from '@/components/global/TurnstileWidget';

interface ApplicationFormProps {
  prefilledPosition?: string;
}

export function ApplicationForm({ prefilledPosition }: ApplicationFormProps) {
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: { position: prefilledPosition ?? '' },
  });

  async function onSubmit(data: JobApplicationFormData) {
    setSubmitState('submitting');
    setServerError('');

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== '') {
        formData.append(key, String(value));
      }
    });
    if (captchaToken) formData.append('turnstileToken', captchaToken);

    try {
      const res = await fetch('/api/careers-application', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? 'Submission failed');
      setSubmitState('success');
      reset();
    } catch (err: unknown) {
      setSubmitState('error');
      setServerError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    }
  }

  if (submitState === 'success') {
    return (
      <div className='flex flex-col items-center border border-green-700 bg-green-950/20 p-8 text-center'>
        <CheckCircle2 className='mb-4 h-12 w-12 text-green-400' aria-hidden='true' />
        <h4 className='mb-2 text-lg font-black uppercase tracking-widest text-white'>
          Application Received
        </h4>
        <p className='text-sm text-slate-400'>
          Thank you for applying. We review every submission and will be in touch if
          there&rsquo;s a match.
        </p>
      </div>
    );
  }

  const input =
    'w-full border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-untele focus:outline-none dark:bg-black';
  const labelCls = 'mb-1 block text-xs font-black uppercase tracking-widest text-slate-400';
  const errCls = 'mt-1 text-xs text-red-400';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5' noValidate>
      {/* Full Name */}
      <div>
        <label htmlFor='fullName' className={labelCls}>Full Name *</label>
        <input
          id='fullName'
          {...register('fullName')}
          placeholder='Jane Smith'
          className={input}
          aria-invalid={!!errors.fullName}
          aria-describedby={errors.fullName ? 'fullName-error' : undefined}
        />
        {errors.fullName && (
          <p id='fullName-error' className={errCls} role='alert'>{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor='email' className={labelCls}>Email Address *</label>
        <input
          id='email'
          {...register('email')}
          type='email'
          placeholder='jane@example.com'
          className={input}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id='email-error' className={errCls} role='alert'>{errors.email.message}</p>
        )}
      </div>

      {/* Position */}
      <div>
        <label htmlFor='position' className={labelCls}>Position *</label>
        <input
          id='position'
          {...register('position')}
          placeholder='e.g. Freelance Reporter, Photographer, General Application'
          className={input}
          aria-invalid={!!errors.position}
          aria-describedby={errors.position ? 'position-error' : undefined}
        />
        {errors.position && (
          <p id='position-error' className={errCls} role='alert'>{errors.position.message}</p>
        )}
      </div>

      {/* Portfolio URL */}
      <div>
        <label htmlFor='portfolioUrl' className={labelCls}>Portfolio / Website URL</label>
        <input
          id='portfolioUrl'
          {...register('portfolioUrl')}
          type='url'
          placeholder='https://yourportfolio.com'
          className={input}
          aria-invalid={!!errors.portfolioUrl}
          aria-describedby={errors.portfolioUrl ? 'portfolioUrl-error' : undefined}
        />
        {errors.portfolioUrl && (
          <p id='portfolioUrl-error' className={errCls} role='alert'>{errors.portfolioUrl.message}</p>
        )}
      </div>

      {/* LinkedIn URL */}
      <div>
        <label htmlFor='linkedinUrl' className={labelCls}>LinkedIn Profile URL</label>
        <input
          id='linkedinUrl'
          {...register('linkedinUrl')}
          type='url'
          placeholder='https://linkedin.com/in/yourname'
          className={input}
          aria-invalid={!!errors.linkedinUrl}
          aria-describedby={errors.linkedinUrl ? 'linkedinUrl-error' : undefined}
        />
        {errors.linkedinUrl && (
          <p id='linkedinUrl-error' className={errCls} role='alert'>{errors.linkedinUrl.message}</p>
        )}
      </div>

      {/* Cover Letter */}
      <div>
        <label htmlFor='coverLetter' className={labelCls}>Cover Letter * (100–3000 characters)</label>
        <textarea
          id='coverLetter'
          {...register('coverLetter')}
          rows={7}
          placeholder="Tell us about yourself, your journalism experience, why you want to contribute to UnTelevised Media, and what stories you want to tell..."
          className={`${input} resize-y`}
          aria-invalid={!!errors.coverLetter}
          aria-describedby={errors.coverLetter ? 'coverLetter-error' : undefined}
        />
        {errors.coverLetter && (
          <p id='coverLetter-error' className={errCls} role='alert'>{errors.coverLetter.message}</p>
        )}
      </div>

      {/* Resume Upload */}
      <div>
        <label htmlFor='resume' className={labelCls}>Resume / CV — PDF or Word, max 5 MB (optional)</label>
        <input
          id='resume'
          {...register('resume')}
          type='file'
          accept='.pdf,.doc,.docx'
          className='w-full border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-300 file:mr-4 file:border-0 file:bg-untele file:px-3 file:py-1.5 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white dark:bg-black'
          aria-invalid={!!errors.resume}
          aria-describedby={errors.resume ? 'resume-error' : undefined}
        />
        {errors.resume && (
          <p id='resume-error' className={errCls} role='alert'>{errors.resume.message as string}</p>
        )}
      </div>

      {/* How did you find us */}
      <div>
        <label htmlFor='howDidYouFindUs' className={labelCls}>How did you find us? *</label>
        <select
          id='howDidYouFindUs'
          {...register('howDidYouFindUs')}
          className={input}
          aria-invalid={!!errors.howDidYouFindUs}
          aria-describedby={errors.howDidYouFindUs ? 'howDidYouFindUs-error' : undefined}
        >
          <option value=''>Select one...</option>
          <option value='existing-reader'>I&apos;m already a reader</option>
          <option value='social-media'>Social media</option>
          <option value='word-of-mouth'>Word of mouth</option>
          <option value='google-search'>Google search</option>
          <option value='other'>Other</option>
        </select>
        {errors.howDidYouFindUs && (
          <p id='howDidYouFindUs-error' className={errCls} role='alert'>{errors.howDidYouFindUs.message}</p>
        )}
      </div>

      {/* Server error */}
      {submitState === 'error' && (
        <div className='flex items-start gap-2 border border-red-700 bg-red-950/20 p-4' role='alert'>
          <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-400' aria-hidden='true' />
          <p className='text-sm text-red-400'>{serverError}</p>
        </div>
      )}

      <TurnstileWidget
        onSuccess={setCaptchaToken}
        onExpire={() => setCaptchaToken(null)}
        onError={() => setCaptchaToken(null)}
      />

      <button
        type='submit'
        disabled={submitState === 'submitting'}
        className='w-full bg-untele py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60'
      >
        {submitState === 'submitting' ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
      </button>
    </form>
  );
}
