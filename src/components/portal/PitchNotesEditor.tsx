'use client';
// src/components/portal/PitchNotesEditor.tsx
// Simple plain-text working notes editor for a claimedPitch.

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { savePitchNotes } from '@/lib/portal/pitch-actions';

interface Props {
  pitchId: string;
  initialText?: string;
}

export function PitchNotesEditor({ pitchId, initialText = '' }: Props) {
  const [text, setText] = useState(initialText);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await savePitchNotes(pitchId, text);
      if (result.success) {
        toast.success('Notes saved.');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={14}
        placeholder='Write your working notes, interview questions, or source contacts here…'
        className='w-full resize-y border border-slate-300 bg-white p-3 font-mono text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-untele focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500'
      />
      <div className='mt-2 flex items-center justify-between'>
        <span className='text-[10px] text-slate-400'>{text.length} chars</span>
        <button
          disabled={isPending}
          onClick={handleSave}
          className='bg-untele px-5 py-2 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-50'
        >
          {isPending ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
}
