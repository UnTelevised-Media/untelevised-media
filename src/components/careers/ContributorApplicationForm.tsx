'use client';
// src/components/careers/ContributorApplicationForm.tsx

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useConsentAwareTracking } from '@/components/analytics/ConsentAwareAnalytics';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  positionsOfInterest: string[];
  otherPosition: string;
  socialMediaPlatforms: string[];
  portfolioWebsite: string;
  youtubeChannel: string;
  socialMediaLinks: Array<{ platform: string; url: string }>;
  experienceLevel: string;
  experienceDescription: string;
  workSamples: Array<{ title: string; url: string }>;
  availability: string;
  additionalInfo: string;
}

const positions = [
  { value: 'article-writer', label: 'Article Writer' },
  { value: 'article-editor', label: 'Article Editor' },
  { value: 'video-editor', label: 'Video Editor' },
  { value: 'live-street-journalist', label: 'Live Street Journalist' },
  { value: 'social-media-manager', label: 'Social Media Manager' },
  { value: 'content-creator', label: 'Content Creator' },
  { value: 'radio-host', label: 'Radio Host' },
  { value: 'video-producer', label: 'Video Producer' },
  { value: 'photographer', label: 'Photographer' },
  { value: 'graphic-designer', label: 'Graphic Designer' },
  { value: 'web-developer', label: 'Web Developer' },
  { value: 'research-analyst', label: 'Research Analyst' },
  { value: 'other', label: 'Other' },
];

const socialPlatforms = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter/X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitch', label: 'Twitch' },
  { value: 'podcast', label: 'Podcast Platforms' },
  { value: 'blog', label: 'Blog/Website' },
  { value: 'other', label: 'Other' },
  { value: 'none', label: 'None' },
];

const experienceLevels = [
  { value: 'beginner', label: 'Complete Beginner (No experience)' },
  { value: 'some', label: 'Some Experience (1-2 years)' },
  { value: 'experienced', label: 'Experienced (3-5 years)' },
  { value: 'expert', label: 'Very Experienced (5+ years)' },
];

const availabilityOptions = [
  { value: 'part-time', label: 'Part-time (10-20 hours/week)' },
  { value: 'full-time', label: 'Full-time (40+ hours/week)' },
  { value: 'freelance', label: 'Freelance/Project-based' },
  { value: 'volunteer', label: 'Volunteer basis' },
  { value: 'flexible', label: 'Flexible/Open to discuss' },
];

const INPUT_CLS =
  'w-full border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none dark:bg-black dark:text-white';
const SECTION_CLS = 'border border-slate-700 bg-slate-950 p-6';

interface Props {
  /** Pre-select a position value matching a positions[] entry (e.g. 'article-writer').
   *  Falls back to 'other' + otherPosition string if no match found. */
  prefilledPosition?: string;
}

export function ContributorApplicationForm({ prefilledPosition }: Props) {
  const { trackEvent } = useConsentAwareTracking();
  const matchedPosition = prefilledPosition
    ? positions.find(
        (p) =>
          p.label.toLowerCase() === prefilledPosition.toLowerCase() ||
          p.value === prefilledPosition.toLowerCase().replace(/\s+/g, '-')
      )
    : undefined;

  const initialPositions = matchedPosition
    ? [matchedPosition.value]
    : prefilledPosition
      ? ['other']
      : [];

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    positionsOfInterest: initialPositions,
    otherPosition: !matchedPosition && prefilledPosition ? prefilledPosition : '',
    socialMediaPlatforms: [],
    portfolioWebsite: '',
    youtubeChannel: '',
    socialMediaLinks: [{ platform: '', url: '' }],
    experienceLevel: '',
    experienceDescription: '',
    workSamples: [{ title: '', url: '' }],
    availability: '',
    additionalInfo: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handle = (field: keyof FormData, value: string | string[]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleCheck = (field: 'positionsOfInterest' | 'socialMediaPlatforms', value: string) =>
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));

  const addItem = (field: 'socialMediaLinks' | 'workSamples') =>
    setFormData((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === 'socialMediaLinks' ? { platform: '', url: '' } : { title: '', url: '' },
      ],
    }));

  const removeItem = (field: 'socialMediaLinks' | 'workSamples', index: number) =>
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));

  const updateItem = (
    field: 'socialMediaLinks' | 'workSamples',
    index: number,
    key: string,
    value: string
  ) =>
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');
    try {
      const cleaned = {
        ...formData,
        socialMediaLinks: formData.socialMediaLinks.filter((l) => l.platform && l.url),
        workSamples: formData.workSamples.filter((s) => s.title && s.url),
      };
      const res = await fetch('/api/job-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleaned),
      });
      if (!res.ok) throw new Error('submission failed');
      trackEvent('contributor_application_submitted', {
        positions: formData.positionsOfInterest.join(','),
        experience_level: formData.experienceLevel,
        availability: formData.availability,
      });
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'success') {
    return (
      <div className='flex flex-col items-center gap-4 py-12 text-center'>
        <CheckCircle2 className='h-12 w-12 text-green-500' />
        <h3 className='text-xl font-black uppercase tracking-widest text-slate-900 dark:text-white'>
          APPLICATION SUBMITTED!
        </h3>
        <p className='max-w-md text-slate-600 dark:text-slate-300'>
          Thank you for your interest in joining UnTelevised Media. We&rsquo;ll review your
          application and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Personal Information */}
      <div className={SECTION_CLS}>
        <h5 className='mb-6 text-lg font-black uppercase tracking-widest text-white'>
          Personal Information
        </h5>
        <div className='grid gap-4 md:grid-cols-2'>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>First Name *</label>
            <input
              type='text'
              required
              value={formData.firstName}
              onChange={(e) => handle('firstName', e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>Last Name *</label>
            <input
              type='text'
              required
              value={formData.lastName}
              onChange={(e) => handle('lastName', e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>
              Email Address *
            </label>
            <input
              type='email'
              required
              value={formData.email}
              onChange={(e) => handle('email', e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>Phone Number</label>
            <input
              type='tel'
              value={formData.phone}
              onChange={(e) => handle('phone', e.target.value)}
              className={INPUT_CLS}
            />
          </div>
          <div className='md:col-span-2'>
            <label className='mb-2 block text-sm font-medium text-slate-300'>
              Location (City, State/Country)
            </label>
            <input
              type='text'
              value={formData.location}
              onChange={(e) => handle('location', e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        </div>
      </div>

      {/* Position of Interest */}
      <div className={SECTION_CLS}>
        <h5 className='mb-6 text-lg font-black uppercase tracking-widest text-white'>
          Position(s) of Interest *
        </h5>
        <div className='grid gap-3 md:grid-cols-2'>
          {positions.map((pos) => (
            <label key={pos.value} className='flex cursor-pointer items-center gap-3'>
              <input
                type='checkbox'
                checked={formData.positionsOfInterest.includes(pos.value)}
                onChange={() => toggleCheck('positionsOfInterest', pos.value)}
                className='h-4 w-4 border-slate-600 bg-black text-untele focus:ring-2 focus:ring-untele'
              />
              <span className='text-sm text-slate-300'>{pos.label}</span>
            </label>
          ))}
        </div>
        {formData.positionsOfInterest.includes('other') && (
          <div className='mt-4'>
            <label className='mb-2 block text-sm font-medium text-slate-300'>
              Please specify other position:
            </label>
            <input
              type='text'
              value={formData.otherPosition}
              onChange={(e) => handle('otherPosition', e.target.value)}
              className={INPUT_CLS}
            />
          </div>
        )}
      </div>

      {/* Social Media Platforms */}
      <div className={SECTION_CLS}>
        <h5 className='mb-6 text-lg font-black uppercase tracking-widest text-white'>
          Social Media Platforms You Create Content On
        </h5>
        <div className='grid gap-3 md:grid-cols-2'>
          {socialPlatforms.map((p) => (
            <label key={p.value} className='flex cursor-pointer items-center gap-3'>
              <input
                type='checkbox'
                checked={formData.socialMediaPlatforms.includes(p.value)}
                onChange={() => toggleCheck('socialMediaPlatforms', p.value)}
                className='h-4 w-4 border-slate-600 bg-black text-untele focus:ring-2 focus:ring-untele'
              />
              <span className='text-sm text-slate-300'>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Portfolio & Links */}
      <div className={SECTION_CLS}>
        <h5 className='mb-6 text-lg font-black uppercase tracking-widest text-white'>
          Portfolio &amp; Links
        </h5>
        <div className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>
              Portfolio Website
            </label>
            <input
              type='url'
              value={formData.portfolioWebsite}
              onChange={(e) => handle('portfolioWebsite', e.target.value)}
              placeholder='https://yourportfolio.com'
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>
              YouTube Channel
            </label>
            <input
              type='url'
              value={formData.youtubeChannel}
              onChange={(e) => handle('youtubeChannel', e.target.value)}
              placeholder='https://youtube.com/@yourchannel'
              className={INPUT_CLS}
            />
          </div>
          <div>
            <label className='mb-3 block text-sm font-medium text-slate-300'>
              Other Social Media Links
            </label>
            {formData.socialMediaLinks.map((link, i) => (
              <div key={i} className='mb-3 flex gap-3'>
                <input
                  type='text'
                  placeholder='Platform (e.g. TikTok)'
                  value={link.platform}
                  onChange={(e) => updateItem('socialMediaLinks', i, 'platform', e.target.value)}
                  className='flex-1 border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                />
                <input
                  type='url'
                  placeholder='https://...'
                  value={link.url}
                  onChange={(e) => updateItem('socialMediaLinks', i, 'url', e.target.value)}
                  className='flex-[2] border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                />
                {formData.socialMediaLinks.length > 1 && (
                  <button
                    type='button'
                    onClick={() => removeItem('socialMediaLinks', i)}
                    className='bg-red-700 px-3 text-white hover:bg-red-600'
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type='button'
              onClick={() => addItem('socialMediaLinks')}
              className='text-sm font-medium text-untele hover:text-red-400'
            >
              + Add Another Link
            </button>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className={SECTION_CLS}>
        <h5 className='mb-6 text-lg font-black uppercase tracking-widest text-white'>
          Experience
        </h5>
        <div className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>
              Experience Level *
            </label>
            <select
              required
              value={formData.experienceLevel}
              onChange={(e) => handle('experienceLevel', e.target.value)}
              className={INPUT_CLS}
            >
              <option value=''>Select your experience level</option>
              {experienceLevels.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>
              Tell Us About Your Experience *
            </label>
            <p className='mb-2 text-xs text-slate-400'>
              Enthusiasm and willingness to learn matter more than credentials.
            </p>
            <textarea
              required
              rows={6}
              value={formData.experienceDescription}
              onChange={(e) => handle('experienceDescription', e.target.value)}
              placeholder='Your background, what drives you, relevant skills...'
              className={INPUT_CLS}
            />
          </div>
        </div>
      </div>

      {/* Work Samples */}
      <div className={SECTION_CLS}>
        <h5 className='mb-4 text-lg font-black uppercase tracking-widest text-white'>
          Work Samples / Links
        </h5>
        <p className='mb-4 text-xs text-slate-400'>
          Share links to articles, videos, or any relevant content (optional but helpful)
        </p>
        {formData.workSamples.map((sample, i) => (
          <div key={i} className='mb-3 flex gap-3'>
            <input
              type='text'
              placeholder='Sample Title/Description'
              value={sample.title}
              onChange={(e) => updateItem('workSamples', i, 'title', e.target.value)}
              className='flex-1 border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
            />
            <input
              type='url'
              placeholder='https://...'
              value={sample.url}
              onChange={(e) => updateItem('workSamples', i, 'url', e.target.value)}
              className='flex-[2] border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
            />
            {formData.workSamples.length > 1 && (
              <button
                type='button'
                onClick={() => removeItem('workSamples', i)}
                className='bg-red-700 px-3 text-white hover:bg-red-600'
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type='button'
          onClick={() => addItem('workSamples')}
          className='text-sm font-medium text-untele hover:text-red-400'
        >
          + Add Another Sample
        </button>
      </div>

      {/* Availability & Additional Info */}
      <div className={SECTION_CLS}>
        <h5 className='mb-6 text-lg font-black uppercase tracking-widest text-white'>
          Availability &amp; Additional Information
        </h5>
        <div className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>Availability *</label>
            <select
              required
              value={formData.availability}
              onChange={(e) => handle('availability', e.target.value)}
              className={INPUT_CLS}
            >
              <option value=''>Select your availability</option>
              {availabilityOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-300'>
              Additional Information
            </label>
            <p className='mb-2 text-xs text-slate-400'>
              Special skills, equipment you own, unique perspectives, etc.
            </p>
            <textarea
              rows={4}
              value={formData.additionalInfo}
              onChange={(e) => handle('additionalInfo', e.target.value)}
              placeholder='Anything else that might be relevant...'
              className={INPUT_CLS}
            />
          </div>
        </div>
      </div>

      <div>
        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isSubmitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
        </button>
        {status === 'error' && (
          <p className='mt-4 flex items-center gap-2 text-sm text-red-400'>
            <AlertCircle className='h-4 w-4' />
            There was an error submitting your application. Please try again.
          </p>
        )}
      </div>
    </form>
  );
}
