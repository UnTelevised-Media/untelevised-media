// src/components/post/CorrectionNotice.tsx
import { AlertTriangle, Info, RefreshCw, XCircle } from 'lucide-react';
import formatDate from '@/util/formatDate';

type CorrectionType = 'correction' | 'clarification' | 'update' | 'retraction';

interface CorrectionData {
  type: CorrectionType;
  issuedAt?: string;
  summary?: string;
  detail: string;
}

const CONFIG: Record<
  CorrectionType,
  {
    label: string;
    Icon: React.ElementType;
    borderClass: string;
    bgClass: string;
    labelClass: string;
    iconClass: string;
  }
> = {
  correction: {
    label: 'CORRECTION',
    Icon: AlertTriangle,
    borderClass: 'border-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    labelClass: 'bg-amber-400 text-black',
    iconClass: 'text-amber-500',
  },
  clarification: {
    label: 'CLARIFICATION',
    Icon: Info,
    borderClass: 'border-blue-400',
    bgClass: 'bg-blue-50 dark:bg-blue-950/40',
    labelClass: 'bg-blue-500 text-white',
    iconClass: 'text-blue-500',
  },
  update: {
    label: 'UPDATE',
    Icon: RefreshCw,
    borderClass: 'border-green-400',
    bgClass: 'bg-green-50 dark:bg-green-950/40',
    labelClass: 'bg-green-500 text-white',
    iconClass: 'text-green-500',
  },
  retraction: {
    label: 'RETRACTION',
    Icon: XCircle,
    borderClass: 'border-untele',
    bgClass: 'bg-red-50 dark:bg-red-950/40',
    labelClass: 'bg-untele text-white',
    iconClass: 'text-untele',
  },
};

export function CorrectionNotice({ correction }: { correction: CorrectionData }) {
  const config = CONFIG[correction.type] ?? CONFIG.correction;
  const { label, Icon, borderClass, bgClass, labelClass, iconClass } = config;

  return (
    <aside
      className={`my-6 border-l-4 ${borderClass} ${bgClass} px-4 py-4`}
      role='note'
      aria-label={`${label}: ${correction.detail}`}
    >
      <div className='mb-2 flex items-center gap-2'>
        <Icon className={`h-4 w-4 ${iconClass}`} aria-hidden='true' />
        <span className={`px-2 py-0.5 text-xs font-black uppercase tracking-widest ${labelClass}`}>
          {label}
        </span>
        {correction.issuedAt && (
          <time
            dateTime={correction.issuedAt}
            className='text-xs text-slate-500 dark:text-slate-400'
          >
            {formatDate(correction.issuedAt)}
          </time>
        )}
      </div>
      <p className='text-sm leading-relaxed text-slate-700 dark:text-slate-300'>
        {correction.detail}
      </p>
    </aside>
  );
}
