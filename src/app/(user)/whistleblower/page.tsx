/* eslint-disable react/function-component-definition */
// src/app/(user)/whistleblower/page.tsx
'use client';

import React, { useState } from 'react';
import { Eye, Shield, Lock, AlertTriangle, FileText } from 'lucide-react';

export default function WhistleblowerPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    organization: '',
    location: '',
    timeframe: '',
    category: '',
    severity: 'medium',
    evidence: '',
    witnessInfo: '',
    contactInfo: '',
    isAnonymous: true,
    protectionNeeded: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submissionId, setSubmissionId] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const generateSubmissionId = () => {
    return 'WB-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const newSubmissionId = generateSubmissionId();

    try {
      const response = await fetch('/api/whistleblower', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submissionId: newSubmissionId,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setSubmissionId(newSubmissionId);
        setFormData({
          title: '',
          description: '',
          organization: '',
          location: '',
          timeframe: '',
          category: '',
          severity: 'medium',
          evidence: '',
          witnessInfo: '',
          contactInfo: '',
          isAnonymous: true,
          protectionNeeded: false,
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
                WHISTLEBLOWER PORTAL
              </h1>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>
          
          <div className='max-w-4xl'>
            <h2 className='mb-6 text-4xl font-black uppercase tracking-wide text-white md:text-5xl'>
              EXPOSE THE TRUTH
            </h2>
            <p className='text-xl text-slate-300 leading-relaxed'>
              Have information about corruption, misconduct, or wrongdoing? We protect sources 
              and investigate credible leads with the highest level of security and discretion.
            </p>
          </div>
        </div>
      </section>

      {/* PROTECTION FEATURES */}
      <section className='border-b border-slate-800 bg-slate-950 py-12'>
        <div className='mx-auto max-w-7xl px-4'>
          <div className='mb-8 text-center'>
            <h3 className='text-2xl font-bold text-white mb-4'>YOUR PROTECTION IS OUR PRIORITY</h3>
          </div>
          <div className='grid gap-8 md:grid-cols-4'>
            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-untele text-white'>
                <Eye className='h-8 w-8' />
              </div>
              <h4 className='text-lg font-bold text-white mb-2'>ANONYMOUS</h4>
              <p className='text-sm text-slate-400'>Submit without revealing identity</p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-untele text-white'>
                <Shield className='h-8 w-8' />
              </div>
              <h4 className='text-lg font-bold text-white mb-2'>PROTECTED</h4>
              <p className='text-sm text-slate-400'>Source protection guaranteed</p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-untele text-white'>
                <Lock className='h-8 w-8' />
              </div>
              <h4 className='text-lg font-bold text-white mb-2'>ENCRYPTED</h4>
              <p className='text-sm text-slate-400'>Military-grade encryption</p>
            </div>

            <div className='text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-untele text-white'>
                <FileText className='h-8 w-8' />
              </div>
              <h4 className='text-lg font-bold text-white mb-2'>TRACKED</h4>
              <p className='text-sm text-slate-400'>Unique ID for follow-up</p>
            </div>
          </div>
        </div>
      </section>

      {/* SUBMISSION FORM */}
      <section className='bg-black py-16'>
        <div className='mx-auto max-w-4xl px-4'>
          <div className='mb-8 flex items-center space-x-4'>
            <div className='bg-untele px-4 py-2'>
              <h3 className='text-xl font-black uppercase tracking-widest text-white'>
                SECURE SUBMISSION
              </h3>
            </div>
            <div className='h-px flex-1 bg-slate-700' />
          </div>

          {submitStatus === 'success' && (
            <div className='mb-8 border border-green-500 bg-green-500/10 p-6'>
              <h4 className='text-green-400 font-bold text-lg mb-2'>Submission Received</h4>
              <p className='text-green-300 mb-2'>Your submission ID: <span className='font-mono font-bold'>{submissionId}</span></p>
              <p className='text-sm text-green-300'>
                Save this ID for reference. We&rsquo;ll investigate your submission and may contact you if you provided contact information.
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className='mb-8 border border-red-500 bg-red-500/10 p-4 text-red-400'>
              <p className='font-bold'>Error submitting report.</p>
              <p className='text-sm'>Please try again or contact us through alternative means.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Anonymous and Protection Options */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='border border-slate-700 bg-slate-950 p-4'>
                <label className='flex items-center space-x-3'>
                  <input
                    type='checkbox'
                    name='isAnonymous'
                    checked={formData.isAnonymous}
                    onChange={handleInputChange}
                    className='h-4 w-4 bg-slate-800 border-slate-600'
                  />
                  <span className='text-white font-bold'>Anonymous Submission</span>
                </label>
                <p className='mt-2 text-sm text-slate-400'>Recommended for maximum protection</p>
              </div>

              <div className='border border-slate-700 bg-slate-950 p-4'>
                <label className='flex items-center space-x-3'>
                  <input
                    type='checkbox'
                    name='protectionNeeded'
                    checked={formData.protectionNeeded}
                    onChange={handleInputChange}
                    className='h-4 w-4 bg-slate-800 border-slate-600'
                  />
                  <span className='text-white font-bold'>Protection Needed</span>
                </label>
                <p className='mt-2 text-sm text-slate-400'>Check if you feel you may be in danger</p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor='title' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Title/Summary *
              </label>
              <input
                type='text'
                id='title'
                name='title'
                value={formData.title}
                onChange={handleInputChange}
                required
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder='Brief summary of the issue'
              />
            </div>

            {/* Category and Severity */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <label htmlFor='category' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                  Category *
                </label>
                <select
                  id='category'
                  name='category'
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                >
                  <option value=''>Select category</option>
                  <option value='government'>Government Corruption</option>
                  <option value='corporate'>Corporate Misconduct</option>
                  <option value='environmental'>Environmental Crime</option>
                  <option value='human_rights'>Human Rights Violation</option>
                  <option value='financial'>Financial Crime</option>
                  <option value='healthcare'>Healthcare Fraud</option>
                  <option value='military'>Military/Defense</option>
                  <option value='law_enforcement'>Law Enforcement</option>
                  <option value='other'>Other</option>
                </select>
              </div>

              <div>
                <label htmlFor='severity' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                  Severity Level *
                </label>
                <select
                  id='severity'
                  name='severity'
                  value={formData.severity}
                  onChange={handleInputChange}
                  required
                  className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                >
                  <option value='low'>Low Impact</option>
                  <option value='medium'>Medium Impact</option>
                  <option value='high'>High Impact</option>
                  <option value='critical'>Critical/Life-threatening</option>
                </select>
              </div>
            </div>

            {/* Organization and Location */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div>
                <label htmlFor='organization' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                  Organization/Entity Involved
                </label>
                <input
                  type='text'
                  id='organization'
                  name='organization'
                  value={formData.organization}
                  onChange={handleInputChange}
                  className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                  placeholder='Company, agency, or organization name'
                />
              </div>

              <div>
                <label htmlFor='location' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                  Location
                </label>
                <input
                  type='text'
                  id='location'
                  name='location'
                  value={formData.location}
                  onChange={handleInputChange}
                  className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                  placeholder='City, State, Country'
                />
              </div>
            </div>

            {/* Timeframe */}
            <div>
              <label htmlFor='timeframe' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                When Did This Occur?
              </label>
              <input
                type='text'
                id='timeframe'
                name='timeframe'
                value={formData.timeframe}
                onChange={handleInputChange}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder='e.g., January 2024, Last month, Ongoing since 2023'
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor='description' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Detailed Description *
              </label>
              <textarea
                id='description'
                name='description'
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={6}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder='Provide detailed information about what happened, who was involved, and why this is important...'
              />
            </div>

            {/* Evidence */}
            <div>
              <label htmlFor='evidence' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Evidence Description
              </label>
              <textarea
                id='evidence'
                name='evidence'
                value={formData.evidence}
                onChange={handleInputChange}
                rows={4}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder='Describe any documents, recordings, photos, or other evidence you have (do not upload files here)'
              />
            </div>

            {/* Witness Info */}
            <div>
              <label htmlFor='witnessInfo' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Witness Information
              </label>
              <textarea
                id='witnessInfo'
                name='witnessInfo'
                value={formData.witnessInfo}
                onChange={handleInputChange}
                rows={3}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder='Are there other witnesses? (Do not include real names for their protection)'
              />
            </div>

            {/* Contact Info */}
            <div>
              <label htmlFor='contactInfo' className='block text-sm font-bold uppercase tracking-wide text-white mb-2'>
                Contact Information (Optional)
              </label>
              <textarea
                id='contactInfo'
                name='contactInfo'
                value={formData.contactInfo}
                onChange={handleInputChange}
                rows={3}
                className='w-full bg-slate-900 border border-slate-700 px-4 py-3 text-white focus:border-untele focus:outline-none'
                placeholder='How can we reach you if needed? (Leave blank for anonymous submission)'
              />
            </div>

            {/* Warning */}
            <div className='border border-yellow-500 bg-yellow-500/10 p-4'>
              <div className='flex items-start space-x-3'>
                <AlertTriangle className='h-5 w-5 text-yellow-500 mt-0.5' />
                <div>
                  <p className='text-yellow-400 font-bold'>Important Security Notice</p>
                  <p className='text-sm text-yellow-300 mb-2'>
                    • Do not submit from work computers or networks
                  </p>
                  <p className='text-sm text-yellow-300 mb-2'>
                    • Consider using a VPN or public WiFi for additional anonymity
                  </p>
                  <p className='text-sm text-yellow-300'>
                    • We will never reveal your identity without your explicit consent
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-untele px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? 'SUBMITTING SECURELY...' : 'SUBMIT WHISTLEBLOWER REPORT'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
