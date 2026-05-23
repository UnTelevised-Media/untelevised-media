'use client';
// src/components/careers/ApplicationForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobApplicationSchema, type JobApplicationFormData } from '@/lib/validations/jobApplicationSchema';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ApplicationFormProps {
  prefilledPosition?: string;
}

export function ApplicationForm({ prefilledPosition }: ApplicationFormProps) {
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

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
        <CheckCircle2 className='mb-4 h-12 w-12 text-green-400' />
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
  const label = 'mb-1 block text-xs font-black uppercase tracking-widest text-slate-400';
  const err = 'mt-1 text-xs text-red-400';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5' noValidate>
      {/* Full Name */}
      <div>
        <label htmlFor='fullName' className={label}>Full Name *</label>
        <input id='fullName' {...register('fullName')} placeholder='Jane Smith' className={input} />
        {errors.fullName && <p className={err}>{errors.fullName.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor='email' className={label}>Email Address *</label>
        <input id='email' {...register('email')} type='email' placeholder='jane@example.com' className={input} />
        {errors.email && <p className={err}>{errors.email.message}</p>}
      </div>

      {/* Position */}
      <div>
        <label htmlFor='position' className={label}>Position *</label>
        <input
          id='position'
          {...register('position')}
          placeholder='e.g. Freelance Reporter, Photographer, General Application'
          className={input}
        />
        {errors.position && <p className={err}>{errors.position.message}</p>}
      </div>

      {/* Portfolio URL */}
      <div>
        <label htmlFor='portfolioUrl' className={label}>Portfolio / Website URL</label>
        <input
          id='portfolioUrl'
          {...register('portfolioUrl')}
          type='url'
          placeholder='https://yourportfolio.com'
          className={input}
        />
        {errors.portfolioUrl && <p className={err}>{errors.portfolioUrl.message}</p>}
      </div>

      {/* LinkedIn URL */}
      <div>
        <label htmlFor='linkedinUrl' className={label}>LinkedIn Profile URL</label>
        <input
          id='linkedinUrl'
          {...register('linkedinUrl')}
          type='url'
          placeholder='https://linkedin.com/in/yourname'
          className={input}
        />
        {errors.linkedinUrl && <p className={err}>{errors.linkedinUrl.message}</p>}
      </div>

      {/* Cover Letter */}
      <div>
        <label htmlFor='coverLetter' className={label}>Cover Letter * (100–3000 characters)</label>
        <textarea
          id='coverLetter'
          {...register('coverLetter')}
          rows={7}
          placeholder="Tell us about yourself, your journalism experience, why you want to contribute to UnTelevised Media, and what stories you want to tell..."
          className={`${input} resize-y`}
        />
        {errors.coverLetter && <p className={err}>{errors.coverLetter.message}</p>}
      </div>

      {/* Resume Upload */}
      <div>
        <label htmlFor='resume' className={label}>Resume / CV — PDF or Word, max 5 MB (optional)</label>
        <input
          id='resume'
          {...register('resume')}
          type='file'
          accept='.pdf,.doc,.docx'
          className='w-full border border-slate-600 bg-slate-900 px-4 py-3 text-sm text-slate-300 file:mr-4 file:border-0 file:bg-untele file:px-3 file:py-1.5 file:text-xs file:font-black file:uppercase file:tracking-widest file:text-white dark:bg-black'
        />
        {errors.resume && <p className={err}>{errors.resume.message as string}</p>}
      </div>

      {/* How did you find us */}
      <div>
        <label htmlFor='howDidYouFindUs' className={label}>How did you find us? *</label>
        <select id='howDidYouFindUs' {...register('howDidYouFindUs')} className={input}>
          <option value=''>Select one...</option>
          <option value='existing-reader'>I&apos;m already a reader</option>
          <option value='social-media'>Social media</option>
          <option value='word-of-mouth'>Word of mouth</option>
          <option value='google-search'>Google search</option>
          <option value='other'>Other</option>
        </select>
        {errors.howDidYouFindUs && <p className={err}>{errors.howDidYouFindUs.message}</p>}
      </div>

      {/* Server error */}
      {submitState === 'error' && (
        <div className='flex items-start gap-2 border border-red-700 bg-red-950/20 p-4'>
          <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-red-400' />
          <p className='text-sm text-red-400'>{serverError}</p>
        </div>
      )}

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
