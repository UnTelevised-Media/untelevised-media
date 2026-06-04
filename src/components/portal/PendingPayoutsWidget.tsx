// src/components/portal/PendingPayoutsWidget.tsx
// Server-renderable display widget for pending payouts.
// No client state needed — purely presentational.

import Link from 'next/link';

export interface PayoutRow {
  id: string;
  author_clerk_id: string;
  period_start: string;
  period_end: string;
  gross_cents: number;
  net_cents: number;
  notes: string | null;
  created_at: string;
}

interface Props {
  payouts: PayoutRow[];
  isAdmin: boolean;
  accruing?: number; // cents accruing this period (net after Stripe)
  nextPayoutDate?: string; // formatted date string, e.g. "May 16, 2026"
  periodStart?: string; // e.g. "2026-05-01"
  periodEnd?: string; // e.g. "2026-05-15"
}

function centsToUsd(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function PendingPayoutsWidget({
  payouts,
  isAdmin,
  accruing = 0,
  nextPayoutDate,
  periodStart,
  periodEnd,
}: Props) {
  const totalNet = payouts.reduce((s, p) => s + p.net_cents, 0);
  const showProjected = payouts.length === 0 && accruing > 0 && nextPayoutDate;

  return (
    <div className='flex flex-col border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'>
      {/* Header bar */}
      <div className='flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-700'>
        <span className='text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400'>
          Pending Payouts
        </span>
        {payouts.length > 0 && (
          <span className='text-sm font-black text-untele'>{centsToUsd(totalNet)}</span>
        )}
        {showProjected && (
          <span className='text-sm font-black text-green-600 dark:text-green-400'>
            {centsToUsd(accruing)}
          </span>
        )}
      </div>

      {/* List */}
      <div className='flex-1 overflow-y-auto' style={{ maxHeight: 260 }}>
        {payouts.length === 0 ? (
          showProjected ? (
            <div className='px-4 py-4'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-[10px] font-black uppercase tracking-widest text-slate-500'>
                    Upcoming · Scheduled
                  </p>
                  <p className='mt-0.5 text-xs font-bold text-slate-700 dark:text-slate-300'>
                    {nextPayoutDate}
                  </p>
                  {periodStart && periodEnd && (
                    <p className='mt-0.5 text-[10px] text-slate-400'>
                      {periodStart} → {periodEnd}
                    </p>
                  )}
                </div>
                <div className='shrink-0 text-right'>
                  <p className='text-sm font-black text-green-600 dark:text-green-400'>
                    {centsToUsd(accruing)}
                  </p>
                  <p className='text-[10px] text-slate-400'>accruing</p>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-center px-4 py-8'>
              <p className='text-xs font-bold uppercase tracking-widest text-slate-400'>
                No pending payouts
              </p>
            </div>
          )
        ) : (
          <ul className='divide-y divide-slate-100 dark:divide-slate-800'>
            {payouts.map((p) => (
              <li key={p.id} className='flex items-start justify-between gap-3 px-4 py-3'>
                <div className='min-w-0 flex-1'>
                  <p className='text-[10px] font-bold text-slate-600 dark:text-slate-300'>
                    {p.period_start} → {p.period_end}
                  </p>
                  {isAdmin && (
                    <p className='text-[10px] text-slate-400' title={p.author_clerk_id}>
                      {p.author_clerk_id.slice(-8)}
                    </p>
                  )}
                  {p.notes && <p className='truncate text-[10px] text-slate-400'>{p.notes}</p>}
                </div>
                <div className='shrink-0 text-right'>
                  <p className='text-xs font-black text-untele'>{centsToUsd(p.net_cents)}</p>
                  <p className='text-[10px] text-slate-400'>gross {centsToUsd(p.gross_cents)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className='border-t border-slate-200 px-4 py-2.5 dark:border-slate-700'>
        <Link
          href='/portal/earnings'
          className='text-[10px] font-black uppercase tracking-widest text-untele hover:underline'
        >
          Payout History →
        </Link>
      </div>
    </div>
  );
}
