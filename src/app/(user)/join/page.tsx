/* eslint-disable react/function-component-definition */
// src/app/(user)/join/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  positionsOfInterest: [],
  otherPosition: '',
  socialMediaPlatforms: [],
  portfolioWebsite: '',
  youtubeChannel: '',
  socialMediaLinks: [{ platform: '', url: '' }],
  experienceLevel: '',
  experienceDescription: '',
  workSamples: [{ title: '', url: '' }],
  availability: '',
  additionalInfo: '',
};

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

export default function JoinPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const router = useRouter();

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (
    field: 'positionsOfInterest' | 'socialMediaPlatforms',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const addArrayItem = (field: 'socialMediaLinks' | 'workSamples') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === 'socialMediaLinks' ? { platform: '', url: '' } : { title: '', url: '' },
      ],
    }));
  };

  const removeArrayItem = (field: 'socialMediaLinks' | 'workSamples', index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (
    field: 'socialMediaLinks' | 'workSamples',
    index: number,
    key: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Filter out empty social media links and work samples
      const cleanedData = {
        ...formData,
        socialMediaLinks: formData.socialMediaLinks.filter((link) => link.platform && link.url),
        workSamples: formData.workSamples.filter((sample) => sample.title && sample.url),
      };

      const response = await fetch('/api/job-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      setSubmitStatus('success');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-black text-white'>
        <div className='mx-auto max-w-2xl px-4 text-center'>
          <div className='mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-600'>
            <svg
              className='h-8 w-8 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </div>
          <h1 className='mb-4 text-3xl font-black uppercase tracking-widest text-white'>
            APPLICATION SUBMITTED!
          </h1>
          <p className='mb-6 text-lg text-slate-300'>
            Thank you for your interest in joining UnTelevised Media. We&apos;ll review your
            application and get back to you soon.
          </p>
          <p className='text-sm text-slate-400'>Redirecting to homepage in a few seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black text-white'>
      {/* HERO SECTION */}
      <section className='border-b border-slate-800 bg-gradient-to-b from-slate-950 to-black py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h1 className='text-3xl font-black uppercase tracking-widest text-white'>
                JOIN THE MISSION
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>

          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-white md:text-5xl'>
              BECOME AN INDEPENDENT JOURNALIST
            </h2>
            <p className='mb-6 text-xl leading-relaxed text-slate-300'>
              Ready to report the truth without compromise? Join our team of fearless journalists
              who go where mainstream media won&apos;t.
            </p>
            <div className='rounded border-l-4 border-untele bg-untele/20 p-6'>
              <p className='mb-2 text-lg font-semibold text-white'>🌟 Experience NOT Required!</p>
              <p className='text-slate-300'>
                We value passion, integrity, and willingness to learn over credentials. Whether
                you&apos;re a seasoned professional or just starting out, if you&apos;re committed
                to truth-telling, we want to hear from you.
              </p>
            </div>

            <p className='mt-6 text-sm text-slate-400'>
              Looking for a specific open role?{' '}
              <a href='/careers' className='font-bold text-untele hover:underline'>
                View open positions on our Careers page →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* POSITIONS SECTION */}
      <section className='border-b border-slate-800 bg-slate-950 py-16'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-12 text-center'>
            <div className='mb-6 inline-block bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                OPEN POSITIONS
              </h3>
            </div>
            <h4 className='mb-4 text-3xl font-bold text-white'>WE&apos;RE LOOKING FOR</h4>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {positions.slice(0, -1).map((position) => (
              <div
                key={position.value}
                className='border border-slate-700 bg-black p-6 transition-all hover:border-untele'
              >
                <h5 className='mb-3 text-lg font-bold uppercase tracking-wide text-white'>
                  {position.label}
                </h5>
                <p className='text-sm text-slate-300'>
                  Join our team and help expose the truth through {position.label.toLowerCase()}{' '}
                  work.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APPLICATION FORM */}
      <section className='bg-black py-16'>
        <div className='mx-auto max-w-4xl px-4'>
          <div className='mb-12 text-center'>
            <div className='mb-6 inline-block bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                APPLICATION FORM
              </h3>
            </div>
            <h4 className='mb-4 text-3xl font-bold text-white'>READY TO JOIN US?</h4>
            <p className='text-lg text-slate-300'>
              Fill out the form below and let&apos;s start a conversation about how you can
              contribute to independent journalism.
            </p>
          </div>

          <form onSubmit={handleSubmit} className='space-y-8'>
            {/* Personal Information */}
            <div className='rounded border border-slate-700 bg-slate-950 p-6'>
              <h5 className='mb-6 text-xl font-bold text-white'>Personal Information</h5>
              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    First Name *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    Last Name *
                  </label>
                  <input
                    type='text'
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
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
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    Phone Number
                  </label>
                  <input
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    Location (City, State/Country)
                  </label>
                  <input
                    type='text'
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  />
                </div>
              </div>
            </div>

            {/* Position Interest */}
            <div className='rounded border border-slate-700 bg-slate-950 p-6'>
              <h5 className='mb-6 text-xl font-bold text-white'>Position(s) of Interest *</h5>
              <div className='grid gap-3 md:grid-cols-2'>
                {positions.map((position) => (
                  <label
                    key={position.value}
                    className='flex cursor-pointer items-center space-x-3'
                  >
                    <input
                      type='checkbox'
                      checked={formData.positionsOfInterest.includes(position.value)}
                      onChange={() => handleCheckboxChange('positionsOfInterest', position.value)}
                      className='h-4 w-4 rounded border-slate-600 bg-black text-untele focus:ring-2 focus:ring-untele'
                    />
                    <span className='text-slate-300'>{position.label}</span>
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
                    onChange={(e) => handleInputChange('otherPosition', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  />
                </div>
              )}
            </div>

            {/* Social Media Platforms */}
            <div className='rounded border border-slate-700 bg-slate-950 p-6'>
              <h5 className='mb-6 text-xl font-bold text-white'>
                Social Media Platforms You Create Content On
              </h5>
              <div className='grid gap-3 md:grid-cols-2'>
                {socialPlatforms.map((platform) => (
                  <label
                    key={platform.value}
                    className='flex cursor-pointer items-center space-x-3'
                  >
                    <input
                      type='checkbox'
                      checked={formData.socialMediaPlatforms.includes(platform.value)}
                      onChange={() => handleCheckboxChange('socialMediaPlatforms', platform.value)}
                      className='h-4 w-4 rounded border-slate-600 bg-black text-untele focus:ring-2 focus:ring-untele'
                    />
                    <span className='text-slate-300'>{platform.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Portfolio & Links */}
            <div className='rounded border border-slate-700 bg-slate-950 p-6'>
              <h5 className='mb-6 text-xl font-bold text-white'>Portfolio & Links</h5>
              <div className='space-y-6'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    Portfolio Website
                  </label>
                  <input
                    type='url'
                    value={formData.portfolioWebsite}
                    onChange={(e) => handleInputChange('portfolioWebsite', e.target.value)}
                    placeholder='https://yourportfolio.com'
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    YouTube Channel
                  </label>
                  <input
                    type='url'
                    value={formData.youtubeChannel}
                    onChange={(e) => handleInputChange('youtubeChannel', e.target.value)}
                    placeholder='https://youtube.com/@yourchannel'
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  />
                </div>

                {/* Other Social Media Links */}
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    Other Social Media Links
                  </label>
                  {formData.socialMediaLinks.map((link, index) => (
                    <div key={index} className='mb-3 flex gap-3'>
                      <input
                        type='text'
                        placeholder='Platform (e.g., TikTok, Instagram)'
                        value={link.platform}
                        onChange={(e) =>
                          updateArrayItem('socialMediaLinks', index, 'platform', e.target.value)
                        }
                        className='flex-1 rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                      />
                      <input
                        type='url'
                        placeholder='https://...'
                        value={link.url}
                        onChange={(e) =>
                          updateArrayItem('socialMediaLinks', index, 'url', e.target.value)
                        }
                        className='flex-2 rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                      />
                      {formData.socialMediaLinks.length > 1 && (
                        <button
                          type='button'
                          onClick={() => removeArrayItem('socialMediaLinks', index)}
                          className='rounded bg-red-600 px-3 py-3 text-white hover:bg-red-700'
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type='button'
                    onClick={() => addArrayItem('socialMediaLinks')}
                    className='text-sm font-medium text-untele hover:text-red-400'
                  >
                    + Add Another Link
                  </button>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className='rounded border border-slate-700 bg-slate-950 p-6'>
              <h5 className='mb-6 text-xl font-bold text-white'>Experience</h5>
              <div className='space-y-6'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    Experience Level *
                  </label>
                  <select
                    required
                    value={formData.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  >
                    <option value=''>Select your experience level</option>
                    {experienceLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    Tell Us About Your Experience *
                  </label>
                  <p className='mb-2 text-sm text-slate-400'>
                    Describe your relevant experience, skills, or why you want to join us.
                    Remember: enthusiasm and willingness to learn matter more than credentials!
                  </p>
                  <textarea
                    required
                    rows={6}
                    value={formData.experienceDescription}
                    onChange={(e) => handleInputChange('experienceDescription', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                    placeholder='Tell us about your background, what drives you to pursue journalism, any relevant skills or experiences...'
                  />
                </div>
              </div>
            </div>

            {/* Work Samples */}
            <div className='rounded border border-slate-700 bg-slate-950 p-6'>
              <h5 className='mb-6 text-xl font-bold text-white'>Work Samples/Links</h5>
              <p className='mb-4 text-sm text-slate-400'>
                Share links to your work, articles, videos, or any relevant content (optional but
                helpful)
              </p>
              {formData.workSamples.map((sample, index) => (
                <div key={index} className='mb-3 flex gap-3'>
                  <input
                    type='text'
                    placeholder='Sample Title/Description'
                    value={sample.title}
                    onChange={(e) =>
                      updateArrayItem('workSamples', index, 'title', e.target.value)
                    }
                    className='flex-1 rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  />
                  <input
                    type='url'
                    placeholder='https://...'
                    value={sample.url}
                    onChange={(e) => updateArrayItem('workSamples', index, 'url', e.target.value)}
                    className='flex-2 rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  />
                  {formData.workSamples.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeArrayItem('workSamples', index)}
                      className='rounded bg-red-600 px-3 py-3 text-white hover:bg-red-700'
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type='button'
                onClick={() => addArrayItem('workSamples')}
                className='text-sm font-medium text-untele hover:text-red-400'
              >
                + Add Another Sample
              </button>
            </div>

            {/* Availability & Additional Info */}
            <div className='rounded border border-slate-700 bg-slate-950 p-6'>
              <h5 className='mb-6 text-xl font-bold text-white'>
                Availability & Additional Information
              </h5>
              <div className='space-y-6'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    Availability *
                  </label>
                  <select
                    required
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                  >
                    <option value=''>Select your availability</option>
                    {availabilityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className='mb-2 block text-sm font-medium text-slate-300'>
                    Additional Information
                  </label>
                  <p className='mb-2 text-sm text-slate-400'>
                    Anything else you want us to know? Special skills, equipment you own, unique
                    perspectives, etc.
                  </p>
                  <textarea
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    className='w-full rounded border border-slate-600 bg-black px-4 py-3 text-white focus:border-untele focus:outline-none'
                    placeholder='Tell us anything else that might be relevant...'
                  />
                </div>
              </div>
            </div>

            <div className='text-center'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
              </button>
              {submitStatus === 'error' && (
                <p className='mt-4 text-red-400'>
                  There was an error submitting your application. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
