// src/models/schema/whistleblower.ts
import { defineField, defineType } from 'sanity';
import { Eye } from 'lucide-react';

export default defineType({
  name: 'whistleblower',
  title: 'Whistleblower Submission',
  type: 'document',
  icon: Eye,
  fields: [
    defineField({
      name: 'submissionId',
      title: 'Submission ID',
      description: 'Unique identifier for tracking (auto-generated)',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'title',
      title: 'Title/Summary',
      description: 'Brief title or summary of the information',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Detailed Description',
      description: 'Detailed description of the information or evidence',
      type: 'text',
    }),
    defineField({
      name: 'organization',
      title: 'Organization/Entity Involved',
      description: 'Name of organization, company, or entity involved',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      description: 'Where did this occur? (City, State, Country)',
      type: 'string',
    }),
    defineField({
      name: 'timeframe',
      title: 'When Did This Occur?',
      description: 'When did the events described take place?',
      type: 'string',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      description: 'What type of issue is this?',
      type: 'string',
      options: {
        list: [
          { title: 'Government Corruption', value: 'government' },
          { title: 'Corporate Misconduct', value: 'corporate' },
          { title: 'Environmental Crime', value: 'environmental' },
          { title: 'Human Rights Violation', value: 'human_rights' },
          { title: 'Financial Crime', value: 'financial' },
          { title: 'Healthcare Fraud', value: 'healthcare' },
          { title: 'Military/Defense', value: 'military' },
          { title: 'Law Enforcement', value: 'law_enforcement' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'severity',
      title: 'Severity Level',
      description: 'How serious is this matter?',
      type: 'string',
      options: {
        list: [
          { title: 'Low Impact', value: 'low' },
          { title: 'Medium Impact', value: 'medium' },
          { title: 'High Impact', value: 'high' },
          { title: 'Critical/Life-threatening', value: 'critical' },
        ],
      },
    }),
    defineField({
      name: 'evidence',
      title: 'Evidence Description',
      description: 'Describe any evidence you have (documents, recordings, etc.)',
      type: 'text',
    }),
    defineField({
      name: 'witnessInfo',
      title: 'Witness Information',
      description: 'Are there other witnesses? (Do not include real names)',
      type: 'text',
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      description: 'How can we reach you? (Optional - can be anonymous)',
      type: 'text',
    }),
    defineField({
      name: 'isAnonymous',
      title: 'Anonymous Submission',
      description: 'Do you wish to remain anonymous?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'protectionNeeded',
      title: 'Protection Needed',
      description: 'Do you feel you need protection or are in danger?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      description: 'When this whistleblower report was submitted',
      type: 'datetime',
    }),
    defineField({
      name: 'status',
      title: 'Investigation Status',
      description: 'Current status of this submission',
      type: 'string',
      options: {
        list: [
          { title: 'New Submission', value: 'new' },
          { title: 'Under Review', value: 'review' },
          { title: 'Investigating', value: 'investigating' },
          { title: 'Verification Needed', value: 'verification' },
          { title: 'Story in Progress', value: 'story_progress' },
          { title: 'Published', value: 'published' },
          { title: 'Closed - No Story', value: 'closed' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'priority',
      title: 'Editorial Priority',
      description: 'Editorial team priority assessment',
      type: 'string',
      options: {
        list: [
          { title: 'Low Priority', value: 'low' },
          { title: 'Medium Priority', value: 'medium' },
          { title: 'High Priority', value: 'high' },
          { title: 'Breaking News', value: 'breaking' },
        ],
      },
      initialValue: 'medium',
    }),
    defineField({
      name: 'notes',
      title: 'Editorial Notes',
      description: 'Internal notes for editorial team',
      type: 'text',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      severity: 'severity',
      status: 'status',
    },
    prepare(selection) {
      const { title, category, severity, status } = selection;
      const severityIcon = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : '';
      const categoryLabel = category ? category.replace('_', ' ').toUpperCase() : 'GENERAL';
      return {
        title: title ?? 'Whistleblower Submission',
        subtitle: `${severityIcon} ${categoryLabel} - ${status ?? 'new'}`,
      };
    },
  },
});
