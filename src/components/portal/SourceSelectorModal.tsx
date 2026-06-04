// src/components/portal/SourceSelectorModal.tsx
// Modal for searching/selecting existing sources OR creating a new source inline.
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createSource, fetchAllSources } from '@/lib/portal/source-actions';
import { toast } from 'sonner';

interface SourceItem {
  _id: string;
  label: string;
  type?: string;
  url?: string;
}

interface Props {
  selectedIds: string[];
  onSelect: (source: SourceItem) => void;
}

export default function SourceSelectorModal({ selectedIds, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  // New source form state
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');

  function handleOpen() {
    setOpen(true);
    // Load sources on open
    startTransition(async () => {
      const result = await fetchAllSources();
      if (result.success) setSources(result.data);
    });
  }

  const filtered = sources.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.label?.toLowerCase().includes(q) || s.url?.toLowerCase().includes(q);
  });

  async function handleCreate() {
    if (!newLabel.trim()) {
      toast.error('Source title is required');
      return;
    }
    startTransition(async () => {
      const result = await createSource({
        label: newLabel,
        type: newType as Parameters<typeof createSource>[0]['type'],
        url: newUrl || undefined,
        description: newDescription || undefined,
      });
      if (result.success) {
        const newSource = { _id: result.data._id, label: result.data.label };
        onSelect(newSource);
        setSources((prev) => [newSource, ...prev]);
        toast.success('Source created and linked.');
        setOpen(false);
        setNewLabel('');
        setNewType('');
        setNewUrl('');
        setNewDescription('');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <>
      <Button type='button' variant='outline' size='sm' onClick={handleOpen}>
        + Add / Search Sources
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='max-h-[80vh] overflow-y-auto sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Source Documents</DialogTitle>
          </DialogHeader>

          {/* Mode toggle */}
          <div className='flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-700'>
            <Button
              type='button'
              size='sm'
              variant={mode === 'search' ? 'default' : 'outline'}
              className={mode === 'search' ? 'bg-untele text-white' : ''}
              onClick={() => setMode('search')}
            >
              Search existing
            </Button>
            <Button
              type='button'
              size='sm'
              variant={mode === 'create' ? 'default' : 'outline'}
              className={mode === 'create' ? 'bg-untele text-white' : ''}
              onClick={() => setMode('create')}
            >
              + New source
            </Button>
          </div>

          {mode === 'search' && (
            <div className='space-y-3'>
              <Input
                placeholder='Search by title or URL…'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {isPending && <p className='text-xs text-slate-400'>Loading…</p>}
              <ul className='max-h-72 space-y-1 overflow-y-auto'>
                {filtered.map((s) => {
                  const alreadySelected = selectedIds.includes(s._id);
                  return (
                    <li key={s._id}>
                      <button
                        type='button'
                        disabled={alreadySelected}
                        onClick={() => {
                          onSelect(s);
                          setOpen(false);
                        }}
                        className={`w-full border px-3 py-2 text-left text-sm transition-colors ${
                          alreadySelected
                            ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900'
                            : 'border-slate-200 hover:border-untele hover:text-untele dark:border-slate-700'
                        }`}
                      >
                        <span className='font-medium'>{s.label}</span>
                        {s.type && <span className='ml-2 text-xs text-slate-400'>{s.type}</span>}
                        {alreadySelected && (
                          <span className='ml-2 text-xs text-green-600'>✓ linked</span>
                        )}
                      </button>
                    </li>
                  );
                })}
                {filtered.length === 0 && !isPending && (
                  <p className='py-4 text-center text-xs text-slate-400'>
                    No sources found. Create a new one.
                  </p>
                )}
              </ul>
            </div>
          )}

          {mode === 'create' && (
            <div className='space-y-4'>
              <div>
                <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                  Source Title <span className='text-untele'>*</span>
                </Label>
                <Input
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder='e.g. Court Filing — Fulton County, Interview with official'
                />
              </div>
              <div>
                <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                  Source Type
                </Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select type…' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='document'>Document / Filing</SelectItem>
                    <SelectItem value='interview'>Interview</SelectItem>
                    <SelectItem value='statement'>Official Statement</SelectItem>
                    <SelectItem value='data'>Data / Dataset</SelectItem>
                    <SelectItem value='media'>Video / Audio</SelectItem>
                    <SelectItem value='onscene'>On-Scene Reporting</SelectItem>
                    <SelectItem value='article'>News Article</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                  URL (optional)
                </Label>
                <Input
                  type='url'
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder='https://…'
                />
              </div>
              <div>
                <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                  Notes
                </Label>
                <Textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder='Additional context about this source…'
                />
              </div>
              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => setMode('search')}>
                  Cancel
                </Button>
                <Button
                  type='button'
                  className='bg-untele text-white hover:opacity-90'
                  disabled={isPending || !newLabel.trim()}
                  onClick={handleCreate}
                >
                  {isPending ? 'Creating…' : 'Create & Link Source'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
