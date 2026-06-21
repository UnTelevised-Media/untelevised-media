// Secure Contact statuses and colors
export const SECURE_CONTACT_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewing: 'In Review',
  progress: 'In Progress',
  resolved: 'Resolved',
  archived: 'Archived',
};

export const SECURE_CONTACT_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  reviewing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  archived: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const URGENCY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

// Whistleblower submission statuses and colors
export const WHISTLEBLOWER_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  review: 'Under Review',
  investigating: 'Investigating',
  verification: 'Verification',
  story_progress: 'Story in Progress',
  published: 'Published',
  closed: 'Closed',
  archived: 'Archived',
};

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const PRIORITY_COLORS: Record<string, string> = {
  breaking: 'bg-red-600 text-white',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const WHISTLEBLOWER_CATEGORY_LABELS: Record<string, string> = {
  government: 'Government',
  corporate: 'Corporate',
  environmental: 'Environmental',
  human_rights: 'Human Rights',
  financial: 'Financial',
  healthcare: 'Healthcare',
  military: 'Military',
  law_enforcement: 'Law Enforcement',
  other: 'Other',
};
