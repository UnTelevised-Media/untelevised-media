// src/components/portal/SourceForm.tsx
// Standalone source create/edit form (for /portal/sources/new and edit pages).
'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createSource, updateSource, type SourceWriteInput } from '@/lib/portal/source-actions';

const formSchema = z.object({
  label: z.string().min(1, 'Source title is required').max(300),
  type: z.string().optional(),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  isAnonymous: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  sourceId?: string;
  initialData?: Partial<SourceWriteInput>;
}

export default function SourceForm({ sourceId, initialData }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      label: initialData?.label ?? '',
      type: initialData?.type ?? '',
      url: initialData?.url ?? '',
      description: initialData?.description ?? '',
      isAnonymous: initialData?.isAnonymous ?? false,
    },
  });

  function onSubmit(values: FormValues) {
    const input: SourceWriteInput = {
      label: values.label,
      type: values.type as SourceWriteInput['type'],
      url: values.url || undefined,
      description: values.description || undefined,
      isAnonymous: values.isAnonymous,
    };

    startTransition(async () => {
      const result = sourceId
        ? await updateSource(sourceId, input)
        : await createSource(input);

      if (result.success) {
        toast.success(sourceId ? 'Source updated.' : 'Source created.');
        router.push('/portal/sources');
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Label */}
      <div>
        <Label htmlFor='label' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
          Source Title <span className='text-untele'>*</span>
        </Label>
        <Input
          id='label'
          {...register('label')}
          placeholder='e.g. Court Filing — Fulton County Superior Court'
        />
        {errors.label && (
          <p className='mt-1 text-xs text-red-500'>{errors.label.message}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
          Source Type
        </Label>
        <Controller
          name='type'
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
          )}
        />
      </div>

      {/* URL */}
      <div>
        <Label htmlFor='url' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
          URL (optional)
        </Label>
        <Input
          id='url'
          type='url'
          {...register('url')}
          placeholder='https://…'
        />
        {errors.url && (
          <p className='mt-1 text-xs text-red-500'>{errors.url.message}</p>
        )}
      </div>

      {/* Description / Notes */}
      <div>
        <Label htmlFor='description' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
          Notes
        </Label>
        <Textarea
          id='description'
          {...register('description')}
          rows={3}
          placeholder='Additional context about this source. Not shown to readers if source is anonymous.'
        />
      </div>

      {/* Anonymous flag */}
      <div className='flex items-center gap-3'>
        <Controller
          name='isAnonymous'
          control={control}
          render={({ field }) => (
            <Checkbox
              id='isAnonymous'
              checked={field.value}
              onCheckedChange={(v) => field.onChange(!!v)}
            />
          )}
        />
        <Label htmlFor='isAnonymous'>
          Anonymous source — hide label and notes from readers
        </Label>
      </div>

      <div className='flex gap-3'>
        <Button
          type='submit'
          className='bg-untele text-white hover:opacity-90'
          disabled={isPending}
        >
          {isPending ? 'Saving…' : sourceId ? 'Update Source' : 'Create Source'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={() => router.push('/portal/sources')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
