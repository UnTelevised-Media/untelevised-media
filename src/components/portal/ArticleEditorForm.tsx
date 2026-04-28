// src/components/portal/ArticleEditorForm.tsx
// Full article editor form — Tiptap WYSIWYG + all metadata fields.
// Handles create, update, save-draft, submit-for-review, publish.
'use client';

import { useState, useCallback, useTransition, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  createArticle,
  updateArticle,
  publishArticle,
  submitArticleForReview,
  searchArticles,
  type ArticleWriteInput,
} from '@/lib/portal/article-actions';
import { PitchQuickViewModal, type PitchForModal } from './PitchQuickViewModal';
import { blockNoteToPortableText, portableTextToBlockNote } from '@/lib/portal/blocknote-serializer';
import urlFor from '@/lib/sanity/utils/image';
import { uploadImageToSanity } from '@/lib/portal/image-actions';
import SourceSelectorModal from './SourceSelectorModal';

// Lazy-load the WYSIWYG editor to avoid SSR
const RichTextEditor = dynamic(() => import('./RichTextEditor'), { ssr: false });

// ---------------------------------------------------------------------------
// Form schema
// ---------------------------------------------------------------------------

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').max(200).regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers, hyphens only'),
  description: z.string().max(500).optional(),
  leadParagraph: z.string().max(1000).optional(),
  featured: z.boolean().default(false),
  breakingNews: z.boolean().default(false),
  location: z.string().max(200).optional(),
  allowComments: z.boolean().default(true),
  publishedAt: z.string().optional(),
  tags: z.string().optional(), // comma-separated; parsed to array on submit
  keywords: z.string().optional(),
  authorRef: z.string().optional(),
  hasEmbeddedVideo: z.boolean().default(false),
  videoLink: z.string().optional(),
  eventDate: z.string().optional(),
  methodology: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Category { _id: string; title: string }
interface Author { _id: string; name: string }

interface SourceRef { _id: string; label: string; type?: string; url?: string }
interface CategoryRef { _id: string; title: string }
interface RelatedArticleRef { _id: string; title: string; slug?: { current: string } }

interface Props {
  articleId?: string;
  initialData?: Partial<ArticleWriteInput> & {
    _id?: string;
    status?: string | null;
    author?: { _id: string; name: string };
    categories?: CategoryRef[];
    sources?: SourceRef[];
    relatedArticles?: RelatedArticleRef[];
    mainImage?: { _type: 'image'; asset?: { _id?: string; url?: string }; alt?: string } | null;
  };
  categories: Category[];
  authors: Author[];
  isEditorPlus: boolean;
  currentSanityAuthorId?: string;
  /** The claimedPitch this article was started from — shows floating pitch icon */
  linkedPitch?: PitchForModal | null;
  /** Only needed on new articles — passed to createArticle to link both ways */
  linkedPitchId?: string;
}

// ---------------------------------------------------------------------------
// Slug generator
// ---------------------------------------------------------------------------

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ArticleEditorForm({
  articleId,
  initialData,
  categories,
  authors,
  isEditorPlus,
  currentSanityAuthorId,
  linkedPitch,
  linkedPitchId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPitchModal, setShowPitchModal] = useState(false);

  // Compute the initial BN content exactly once via lazy useState.
  // Never call the setter — this value is only passed to RichTextEditor as
  // `initialContent` so it stays stable across re-renders and never triggers
  // the editor's internal replaceBlocks effect.
  const [initialEditorContent] = useState<object[]>(() => {
    if (initialData?.body && Array.isArray(initialData.body) && initialData.body.length > 0) {
      return portableTextToBlockNote(
        initialData.body as Parameters<typeof portableTextToBlockNote>[0],
        (ref) => urlFor({ asset: { _ref: ref } }).width(800).url(),
      );
    }
    return [];
  });

  // Live editor content — updated on every keystroke via the onChange callback,
  // read only when building the save payload. A ref (not state) means typing
  // does not re-render the rest of the form.
  const editorContentRef = useRef<object[]>(initialEditorContent);

  // Selected categories
  const [selectedCategories, setSelectedCategories] = useState<CategoryRef[]>(
    initialData?.categories ?? [],
  );

  // Selected sources
  const [selectedSources, setSelectedSources] = useState<SourceRef[]>(
    initialData?.sources ?? [],
  );

  // Main image
  const [mainImage, setMainImage] = useState<{
    assetRef: string;
    url: string;
    alt: string;
  } | null>(() => {
    const img = initialData?.mainImage as
      | { asset?: { _id?: string; url?: string }; alt?: string }
      | null
      | undefined;
    if (img?.asset?.url) {
      return { assetRef: img.asset._id ?? '', url: img.asset.url, alt: img.alt ?? '' };
    }
    return null;
  });
  const [imageUploading, setImageUploading] = useState(false);

  // FAQ items
  const [faqs, setFaqs] = useState<{ _key: string; question: string; answer: string }[]>(
    () =>
      ((initialData?.faqs as { _key?: string; question: string; answer: string }[] | undefined) ?? []).map(
        (f) => ({ ...f, _key: f._key ?? Math.random().toString(36).slice(2, 10) }),
      ),
  );

  // Related articles
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticleRef[]>(
    initialData?.relatedArticles ?? [],
  );
  const [articleSearch, setArticleSearch] = useState('');
  const [articleResults, setArticleResults] = useState<RelatedArticleRef[]>([]);
  const [articleSearchPending, startArticleSearch] = useTransition();

  // Correction
  type CorrectionType = 'correction' | 'clarification' | 'update' | 'retraction';
  type CorrectionState = { type: CorrectionType; issuedAt: string; summary: string; detail: string } | null;
  const initCorrection = (initialData as Record<string, unknown>)?.correction as CorrectionState | undefined;
  // Normalize issuedAt: Sanity stores full ISO strings; datetime-local inputs need "yyyy-MM-ddThh:mm"
  const [correction, setCorrection] = useState<CorrectionState>(
    initCorrection ? { ...initCorrection, issuedAt: initCorrection.issuedAt?.slice(0, 16) ?? '' } : null,
  );
  const [correctionOpen, setCorrectionOpen] = useState(!!initCorrection);

  // Autosave indicator
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'idle'>('idle');
  // A document without the "drafts." prefix in its _id is live on the site.
  const isAlreadyPublished = !!initialData?._id && !initialData._id.startsWith('drafts.');
  const isDirtyRef = useRef(false);

  // Form
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      title: (initialData?.title as string) ?? '',
      slug: (initialData?.slug as { current: string } | undefined)?.current ?? '',
      description: (initialData?.description as string) ?? '',
      leadParagraph: (initialData?.leadParagraph as string) ?? '',
      featured: (initialData?.featured as boolean) ?? false,
      breakingNews: (initialData?.breakingNews as boolean) ?? false,
      location: (initialData?.location as string) ?? '',
      allowComments: (initialData?.allowComments as boolean) ?? true,
      publishedAt: initialData?.publishedAt
        ? new Date(initialData.publishedAt as string).toISOString().slice(0, 16)
        : '',
      tags: ((initialData?.tags as string[] | undefined) ?? []).join(', '),
      keywords: ((initialData?.keywords as string[] | undefined) ?? []).join(', '),
      // author comes from Sanity as author->{ _id } not a bare authorRef field
      authorRef:
        (initialData?.author as { _id?: string } | undefined)?._id ??
        (initialData?.authorRef as string | undefined) ??
        currentSanityAuthorId ??
        '',
      hasEmbeddedVideo: (initialData?.hasEmbeddedVideo as boolean) ?? false,
      videoLink: (initialData?.videoLink as string) ?? '',
      eventDate: initialData?.eventDate
        ? new Date(initialData.eventDate as string).toISOString().slice(0, 16)
        : '',
      methodology: (initialData?.methodology as string) ?? '',
    },
  });

  const title = watch('title');

  // Auto-generate slug from title for new articles
  useEffect(() => {
    if (!articleId && title) {
      setValue('slug', titleToSlug(title), { shouldValidate: false });
    }
  }, [title, articleId, setValue]);

  // Track dirty state for leave-warning and autosave
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // ---------------------------------------------------------------------------
  // Build ArticleWriteInput from form values
  // ---------------------------------------------------------------------------

  const buildInput = useCallback(
    (values: FormValues): ArticleWriteInput => {
      const portableBody = blockNoteToPortableText(editorContentRef.current as Parameters<typeof blockNoteToPortableText>[0]);
      return {
        title: values.title,
        slug: { _type: 'slug', current: values.slug },
        description: values.description,
        leadParagraph: values.leadParagraph,
        body: portableBody as Record<string, unknown>[],
        featured: values.featured,
        breakingNews: values.breakingNews,
        needsReview: false,
        publishedAt: values.publishedAt || undefined,
        categories: selectedCategories.map((c) => ({ _type: 'reference' as const, _ref: c._id, _key: c._id })),
        tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        keywords: values.keywords ? values.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
        location: values.location,
        allowComments: values.allowComments,
        authorRef: values.authorRef,
        sources: selectedSources.map((s) => ({ _type: 'reference' as const, _ref: s._id, _key: s._id })),
        relatedArticles: relatedArticles.map((a) => ({ _type: 'reference' as const, _ref: a._id, _key: a._id })),
        methodology: values.methodology,
        hasEmbeddedVideo: values.hasEmbeddedVideo,
        videoLink: values.videoLink || undefined,
        eventDate: values.eventDate || undefined,
        faqs: faqs.filter((f) => f.question.trim() || f.answer.trim()).map((f) => ({ _key: f._key, question: f.question, answer: f.answer })),
        correction: correction ?? undefined,
        mainImage: mainImage?.assetRef
          ? {
              _type: 'image' as const,
              asset: { _type: 'reference' as const, _ref: mainImage.assetRef },
              alt: mainImage.alt,
            }
          : undefined,
      };
    },
    [selectedCategories, selectedSources, mainImage, faqs, relatedArticles, correction],
  );

  // ---------------------------------------------------------------------------
  // Save handlers
  // ---------------------------------------------------------------------------

  function handleSaveDraft(values: FormValues) {
    setSaveStatus('saving');
    const input = buildInput(values);
    startTransition(async () => {
      try {
        const result = articleId
          ? await updateArticle(articleId, input)
          : await createArticle(input, linkedPitchId);
        if (result.success) {
          setSaveStatus('saved');
          toast.success('Draft saved.');
          if (!articleId && 'data' in result) {
            router.replace(`/portal/articles/${result.data._id}/edit`);
          }
        } else {
          setSaveStatus('unsaved');
          toast.error(result.error);
        }
      } catch (err) {
        setSaveStatus('unsaved');
        toast.error(err instanceof Error ? err.message : 'Save failed. Please try again.');
      }
    });
  }

  function handleSubmitForReview(values: FormValues) {
    startTransition(async () => {
      try {
        let id = articleId;
        if (!id) {
          const result = await createArticle(buildInput(values), linkedPitchId);
          if (!result.success) { toast.error(result.error); return; }
          id = result.data._id;
        } else {
          const result = await updateArticle(id, buildInput(values));
          if (!result.success) { toast.error(result.error); return; }
        }
        const reviewResult = await submitArticleForReview(id);
        if (reviewResult.success) {
          toast.success('Submitted for editorial review.');
          router.push('/portal/articles');
        } else {
          toast.error(reviewResult.error);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      }
    });
  }

  function handlePublish(values: FormValues) {
    startTransition(async () => {
      try {
        let id = articleId;
        if (!id) {
          const result = await createArticle(buildInput(values), linkedPitchId);
          if (!result.success) { toast.error(result.error); return; }
          id = result.data._id;
        } else {
          const result = await updateArticle(id, buildInput(values));
          if (!result.success) { toast.error(result.error); return; }
        }
        // Only editors can call publishArticle; authors just update an already-published article
        if (isEditorPlus) {
          const pubResult = await publishArticle(id, values.publishedAt || undefined);
          if (!pubResult.success) { toast.error(pubResult.error); return; }
        }
        toast.success(isEditorPlus ? 'Article published!' : 'Article updated.');
        router.push('/portal/articles');
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Publish failed. Please try again.');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Autosave every 60 seconds when there are unsaved changes
  // ---------------------------------------------------------------------------

  // Autosave every 60 seconds when there are unsaved changes (no redirect on success)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDirtyRef.current) return;
      const values = getValues();
      setSaveStatus('saving');
      const input = buildInput(values as FormValues);
      const articleIdSnapshot = articleId;
      startTransition(async () => {
        try {
          const result = articleIdSnapshot
            ? await updateArticle(articleIdSnapshot, input)
            : await createArticle(input);
          if (result.success) {
            setSaveStatus('saved');
            isDirtyRef.current = false;
          } else {
            setSaveStatus('unsaved');
          }
        } catch {
          setSaveStatus('unsaved');
        }
      });
    }, 60_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, buildInput, getValues]);

  // ---------------------------------------------------------------------------
  // Leave warning
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 's') {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handleSubmit(handleSaveDraft as any)();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        const slug = getValues('slug');
        if (slug) window.open(`/articles/${slug}`, '_blank');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSubmit, getValues]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
    <form className='space-y-8'>
      {/* Sticky action bar */}
      <div className='sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95'>
        <div className='flex items-center gap-2'>
          {saveStatus === 'saving' && (
            <span className='text-xs text-slate-400'>Saving…</span>
          )}
          {saveStatus === 'saved' && (
            <span className='text-xs text-green-600'>Saved</span>
          )}
          {saveStatus === 'unsaved' && (
            <span className='text-xs text-red-500'>Unsaved changes</span>
          )}
        </div>
        <div className='flex flex-wrap gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isPending}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={handleSubmit(handleSaveDraft as any)}
            title='Save Draft (Ctrl+S)'
          >
            {isPending ? 'Saving…' : 'Save Draft'}
          </Button>

          {/* Authors on unpublished articles: submit for editor review */}
          {!isEditorPlus && !isAlreadyPublished && (
            <Button
              type='button'
              size='sm'
              variant='outline'
              disabled={isPending}
              onClick={handleSubmit(handleSubmitForReview)}
            >
              Submit for Review
            </Button>
          )}

          {/* Publish: always for editors; authors can publish updates to already-published articles */}
          {(isEditorPlus || isAlreadyPublished) && (
            <Button
              type='button'
              size='sm'
              className='bg-untele text-white hover:opacity-90'
              disabled={isPending}
              onClick={handleSubmit(handlePublish)}
            >
              {isEditorPlus ? 'Publish' : 'Publish Update'}
            </Button>
          )}

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => {
              const slug = watch('slug');
              if (slug) window.open(`/articles/${slug}`, '_blank');
            }}
            title='Preview (Ctrl+Shift+P)'
          >
            Preview ↗
          </Button>
        </div>
      </div>

      {/* Title */}
      <section>
        <Label htmlFor='title' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
          Title <span className='text-untele'>*</span>
        </Label>
        <Input
          id='title'
          {...register('title')}
          placeholder='Enter your article title…'
          className='text-lg font-bold'
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <p id='title-error' className='mt-1 text-xs text-red-500'>{errors.title.message}</p>
        )}
      </section>

      {/* Slug */}
      <section>
        <Label htmlFor='slug' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
          Slug (URL)
        </Label>
        <div className='flex items-center gap-2'>
          <span className='shrink-0 text-xs text-slate-400'>/articles/</span>
          <Input
            id='slug'
            {...register('slug')}
            placeholder='your-article-slug'
            className='font-mono text-sm'
          />
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='shrink-0'
            onClick={() => {
              const t = watch('title');
              if (t) setValue('slug', titleToSlug(t), { shouldValidate: true });
            }}
          >
            Generate
          </Button>
        </div>
        {errors.slug && (
          <p className='mt-1 text-xs text-red-500'>{errors.slug.message}</p>
        )}
      </section>

      {/* Excerpt / Description */}
      <section>
        <Label htmlFor='description' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
          Excerpt / Summary
        </Label>
        <Textarea
          id='description'
          {...register('description')}
          rows={3}
          placeholder='1–3 sentence summary shown on article cards and in search results…'
        />
      </section>

      {/* Lead paragraph */}
      <section>
        <Label htmlFor='leadParagraph' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
          Lead / First paragraph
          <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
            (used for AI extraction and featured snippets)
          </span>
        </Label>
        <Textarea
          id='leadParagraph'
          {...register('leadParagraph')}
          rows={3}
          placeholder='2–3 sentence plain text summary…'
        />
      </section>

      {/* Main Image */}
      <section>
        <Label className='mb-2 block text-xs font-bold uppercase tracking-widest'>
          Main Image
        </Label>
        <div className='space-y-3'>
          {mainImage?.url && (
            <div className='relative'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImage.url}
                alt={mainImage.alt || 'Article main image'}
                className='max-h-48 w-full object-cover'
              />
              <button
                type='button'
                onClick={() => setMainImage(null)}
                className='absolute right-2 top-2 bg-black/60 px-2 py-1 text-xs text-white hover:bg-black'
              >
                Remove
              </button>
            </div>
          )}
          <div className='flex items-center gap-2'>
            <label
              htmlFor='mainImageFile'
              className={`cursor-pointer border border-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors hover:border-untele dark:border-slate-600 ${imageUploading ? 'opacity-50' : ''}`}
            >
              {imageUploading ? 'Uploading…' : mainImage ? 'Replace Image' : 'Upload Image'}
            </label>
            <input
              id='mainImageFile'
              type='file'
              accept='image/jpeg,image/png,image/webp,image/gif,image/avif'
              className='sr-only'
              disabled={imageUploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImageUploading(true);
                const fd = new FormData();
                fd.append('file', file);
                const result = await uploadImageToSanity(fd);
                setImageUploading(false);
                e.target.value = '';
                if (result.success) {
                  setMainImage({ assetRef: result.assetId, url: result.url, alt: mainImage?.alt ?? '' });
                  isDirtyRef.current = true;
                } else {
                  toast.error(result.error);
                }
              }}
            />
          </div>
          {mainImage && (
            <div>
              <Label htmlFor='mainImageAlt' className='mb-1 block text-xs text-slate-500'>
                Alt text
              </Label>
              <Input
                id='mainImageAlt'
                value={mainImage.alt}
                onChange={(e) => setMainImage((prev) => prev ? { ...prev, alt: e.target.value } : prev)}
                placeholder='Describe the image for screen readers and SEO…'
                className='text-sm'
              />
            </div>
          )}
        </div>
      </section>

      {/* Article body */}
      <section>
        <Label className='mb-2 block text-xs font-bold uppercase tracking-widest'>
          Article Body
        </Label>
        <RichTextEditor
          initialContent={initialEditorContent}
          onChange={(blocks) => {
            editorContentRef.current = blocks;
            isDirtyRef.current = true;
            setSaveStatus('unsaved');
          }}
          placeholder='Start writing your article… type / for commands'
        />
      </section>

      <Separator />

      {/* Metadata grid */}
      <div className='grid gap-6 sm:grid-cols-2'>
        {/* Categories */}
        <section>
          <Label className='mb-2 block text-xs font-bold uppercase tracking-widest'>
            Category
          </Label>
          <div className='flex flex-wrap gap-2'>
            {categories.map((cat) => {
              const selected = selectedCategories.some((c) => c._id === cat._id);
              return (
                <button
                  key={cat._id}
                  type='button'
                  onClick={() =>
                    setSelectedCategories((prev) =>
                      selected
                        ? prev.filter((c) => c._id !== cat._id)
                        : [...prev, cat],
                    )
                  }
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors ${
                    selected
                      ? 'bg-untele text-white'
                      : 'border border-slate-300 text-slate-600 hover:border-untele dark:border-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>
        </section>

        {/* Author (editor+ can change) */}
        {isEditorPlus && authors.length > 0 && (
          <section>
            <Label htmlFor='authorRef' className='mb-2 block text-xs font-bold uppercase tracking-widest'>
              Author
            </Label>
            <Controller
              name='authorRef'
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select author…' />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((a) => (
                      <SelectItem key={a._id} value={a._id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </section>
        )}

        {/* Tags */}
        <section>
          <Label htmlFor='tags' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
            Tags
            <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
              comma-separated, lowercase-hyphen
            </span>
          </Label>
          <Input
            id='tags'
            {...register('tags')}
            placeholder='e.g. police-brutality, city-council, 2024-election'
          />
        </section>

        {/* Keywords */}
        <section>
          <Label htmlFor='keywords' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
            Keywords / SEO
            <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
              comma-separated
            </span>
          </Label>
          <Input
            id='keywords'
            {...register('keywords')}
            placeholder='e.g. criminal justice, housing policy'
          />
        </section>

        {/* Location */}
        <section>
          <Label htmlFor='location' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
            Location
          </Label>
          <Input
            id='location'
            {...register('location')}
            placeholder='e.g. Atlanta, GA'
          />
        </section>

        {/* Published At */}
        <section>
          <Label htmlFor='publishedAt' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
            Publishing Date &amp; Time
            <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
              leave blank to publish now
            </span>
          </Label>
          <Input
            id='publishedAt'
            type='datetime-local'
            {...register('publishedAt')}
          />
        </section>

        {/* Event Date */}
        <section>
          <Label htmlFor='eventDate' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
            Event Date &amp; Time
            <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
              when the event occurred (optional)
            </span>
          </Label>
          <Input
            id='eventDate'
            type='datetime-local'
            {...register('eventDate')}
          />
        </section>
      </div>

      <Separator />

      {/* Sources */}
      <section>
        <Label className='mb-2 block text-xs font-bold uppercase tracking-widest'>
          Source Documents
        </Label>
        <div className='mb-3 space-y-1'>
          {selectedSources.map((s) => (
            <div
              key={s._id}
              className='flex items-start justify-between gap-3 border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900'
            >
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{s.label}</p>
                <div className='mt-0.5 flex flex-wrap items-center gap-2'>
                  {s.type && (
                    <span className='text-[10px] font-bold uppercase tracking-widest text-slate-400'>
                      {s.type}
                    </span>
                  )}
                  {s.url && (
                    <a
                      href={s.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='truncate text-xs text-untele hover:underline'
                    >
                      {s.url}
                    </a>
                  )}
                </div>
              </div>
              <button
                type='button'
                onClick={() => setSelectedSources((prev) => prev.filter((x) => x._id !== s._id))}
                className='shrink-0 text-slate-400 hover:text-red-500'
                aria-label={`Remove ${s.label}`}
              >
                ×
              </button>
            </div>
          ))}
          {selectedSources.length === 0 && (
            <p className='text-xs text-slate-400'>No sources linked yet.</p>
          )}
        </div>
        <SourceSelectorModal
          selectedIds={selectedSources.map((s) => s._id)}
          onSelect={(source) => {
            setSelectedSources((prev) =>
              prev.some((s) => s._id === source._id) ? prev : [...prev, source],
            );
          }}
        />
      </section>

      <Separator />

      {/* Related Articles */}
      <section>
        <Label className='mb-2 block text-xs font-bold uppercase tracking-widest'>
          Related Articles
          <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
            up to 6 — shown in the "Read More" section
          </span>
        </Label>
        <div className='mb-3 space-y-1'>
          {relatedArticles.map((a) => (
            <div
              key={a._id}
              className='flex items-center justify-between gap-3 border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900'
            >
              <span className='min-w-0 flex-1 truncate text-sm'>{a.title}</span>
              <button
                type='button'
                onClick={() => setRelatedArticles((prev) => prev.filter((x) => x._id !== a._id))}
                className='shrink-0 text-slate-400 hover:text-red-500'
                aria-label={`Remove ${a.title}`}
              >
                ×
              </button>
            </div>
          ))}
          {relatedArticles.length === 0 && (
            <p className='text-xs text-slate-400'>No related articles linked yet.</p>
          )}
        </div>

        {relatedArticles.length < 6 && (
          <div className='space-y-2'>
            <div className='flex gap-2'>
              <Input
                value={articleSearch}
                onChange={(e) => {
                  const q = e.target.value;
                  setArticleSearch(q);
                  if (q.trim().length > 1) {
                    startArticleSearch(async () => {
                      const res = await searchArticles(q);
                      if (res.success) setArticleResults(res.data);
                    });
                  } else {
                    setArticleResults([]);
                  }
                }}
                placeholder='Search articles by title…'
                className='text-sm'
              />
              {articleSearchPending && (
                <span className='self-center text-xs text-slate-400'>Searching…</span>
              )}
            </div>
            {articleResults.length > 0 && (
              <ul className='max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700'>
                {articleResults.map((a) => {
                  const alreadyLinked =
                    relatedArticles.some((x) => x._id === a._id) || a._id === articleId;
                  return (
                    <li key={a._id}>
                      <button
                        type='button'
                        disabled={alreadyLinked}
                        onClick={() => {
                          if (!alreadyLinked) {
                            setRelatedArticles((prev) => [...prev, a]);
                            setArticleSearch('');
                            setArticleResults([]);
                          }
                        }}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                          alreadyLinked
                            ? 'cursor-not-allowed bg-slate-50 text-slate-400 dark:bg-slate-900'
                            : 'hover:bg-slate-50 hover:text-untele dark:hover:bg-slate-800'
                        }`}
                      >
                        {a.title}
                        {alreadyLinked && (
                          <span className='ml-2 text-xs text-green-600'>✓</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </section>

      <Separator />

      {/* ── Author controls ──────────────────────────────────────────────── */}
      <section className='space-y-6'>
        <h3 className='text-xs font-bold uppercase tracking-widest text-slate-500'>
          Article settings
        </h3>

        {/* Comments toggle */}
        <div className='flex items-center gap-3'>
          <Controller
            name='allowComments'
            control={control}
            render={({ field }) => (
              <Checkbox
                id='allowComments'
                checked={field.value}
                onCheckedChange={(v) => field.onChange(!!v)}
              />
            )}
          />
          <Label htmlFor='allowComments'>Allow comments on this article</Label>
        </div>

        {/* Featured Video — separate from inline body embeds */}
        <div className='space-y-3'>
          <Label className='block text-xs font-bold uppercase tracking-widest'>
            Featured Video
            <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
              appears as a video player above or alongside the article, not inside the body
            </span>
          </Label>
          <Input
            {...register('videoLink')}
            placeholder='YouTube URL (e.g. https://www.youtube.com/watch?v=…)'
          />
          {watch('videoLink') && (
            <div className='aspect-video max-w-md'>
              <iframe
                src={`https://www.youtube.com/embed/${
                  watch('videoLink')?.match(
                    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/,
                  )?.[1] ?? ''
                }`}
                className='h-full w-full border-0'
                allowFullScreen
              />
            </div>
          )}
          {/* Hidden field keeps the boolean in sync */}
          <Controller
            name='hasEmbeddedVideo'
            control={control}
            render={({ field }) => {
              const hasVideo = !!watch('videoLink');
              if (field.value !== hasVideo) field.onChange(hasVideo);
              return <input type='hidden' value={String(hasVideo)} />;
            }}
          />
        </div>

        {/* FAQ */}
        <div>
          <Label className='mb-2 block text-xs font-bold uppercase tracking-widest'>
            FAQ
            <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
              Q&amp;A pairs for structured data — boosts AI citation and rich snippets
            </span>
          </Label>
          <div className='space-y-3'>
            {faqs.map((faq, i) => (
              <div key={i} className='space-y-2 border border-slate-200 p-3 dark:border-slate-700'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs font-bold uppercase tracking-widest text-slate-400'>
                    Q{i + 1}
                  </span>
                  <button
                    type='button'
                    onClick={() => setFaqs((prev) => prev.filter((_, j) => j !== i))}
                    className='ml-auto text-xs text-slate-400 hover:text-red-500'
                  >
                    Remove
                  </button>
                </div>
                <Input
                  value={faq.question}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, j) => (j === i ? { ...f, question: e.target.value } : f)),
                    )
                  }
                  placeholder='Question…'
                  className='text-sm'
                />
                <Textarea
                  value={faq.answer}
                  onChange={(e) =>
                    setFaqs((prev) =>
                      prev.map((f, j) => (j === i ? { ...f, answer: e.target.value } : f)),
                    )
                  }
                  rows={3}
                  placeholder='Answer (plain text only)…'
                  className='text-sm'
                />
              </div>
            ))}
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setFaqs((prev) => [...prev, { _key: Math.random().toString(36).slice(2, 10), question: '', answer: '' }])}
            >
              + Add FAQ
            </Button>
          </div>
        </div>

        {/* Methodology note */}
        <div>
          <Label htmlFor='methodology' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
            Methodology Note
            <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
              optional — shown in Sources panel
            </span>
          </Label>
          <Textarea
            id='methodology'
            {...register('methodology')}
            rows={3}
            placeholder='How was this story reported? Any FOIA requests, documents obtained, etc.'
          />
        </div>

        {/* Corrections */}
        <div>
        <div className='flex items-center justify-between'>
          <Label className='text-xs font-bold uppercase tracking-widest'>
            Correction / Retraction
            <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
              issue a formal correction, clarification, update, or retraction
            </span>
          </Label>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => {
              if (correctionOpen && correction) {
                setCorrection(null);
              }
              setCorrectionOpen((v) => !v);
            }}
            className={correction ? 'border-untele text-untele' : ''}
          >
            {correction ? 'Edit Correction' : correctionOpen ? 'Cancel' : '+ Add Correction'}
          </Button>
        </div>

        {correction && !correctionOpen && (
          <div className='mt-3 border border-untele bg-red-50 px-4 py-3 dark:bg-red-950/20'>
            <p className='mb-1 text-xs font-bold uppercase tracking-widest text-untele'>
              {correction.type}
            </p>
            <p className='text-sm text-slate-700 dark:text-slate-300'>{correction.summary}</p>
          </div>
        )}

        {correctionOpen && (
          <div className='mt-3 space-y-4 border border-slate-200 p-4 dark:border-slate-700'>
            {/* Type */}
            <div>
              <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                Type <span className='text-untele'>*</span>
              </Label>
              <Select
                value={correction?.type ?? ''}
                onValueChange={(v) =>
                  setCorrection((prev) => ({
                    type: v as CorrectionType,
                    issuedAt: prev?.issuedAt ?? new Date().toISOString().slice(0, 16),
                    summary: prev?.summary ?? '',
                    detail: prev?.detail ?? '',
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select correction type…' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='correction'>Correction — factual error fixed</SelectItem>
                  <SelectItem value='clarification'>Clarification — added context, no error</SelectItem>
                  <SelectItem value='update'>Update — new developments added</SelectItem>
                  <SelectItem value='retraction'>Retraction — article fully withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Issued At */}
            <div>
              <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                Issued At <span className='text-untele'>*</span>
              </Label>
              <Input
                type='datetime-local'
                value={correction?.issuedAt ?? ''}
                onChange={(e) =>
                  setCorrection((prev) =>
                    prev ? { ...prev, issuedAt: e.target.value } : {
                      type: 'correction',
                      issuedAt: e.target.value,
                      summary: '',
                      detail: '',
                    },
                  )
                }
              />
            </div>

            {/* Summary */}
            <div>
              <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                One-Line Summary
                <span className='ml-2 text-[10px] font-normal normal-case text-slate-400'>
                  max 120 chars — shown on article cards
                </span>
              </Label>
              <Input
                value={correction?.summary ?? ''}
                onChange={(e) =>
                  setCorrection((prev) =>
                    prev ? { ...prev, summary: e.target.value } : null,
                  )
                }
                maxLength={120}
                placeholder='e.g. An earlier version misstated the vote count.'
              />
            </div>

            {/* Detail */}
            <div>
              <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                Full Correction Text <span className='text-untele'>*</span>
              </Label>
              <Textarea
                value={correction?.detail ?? ''}
                onChange={(e) =>
                  setCorrection((prev) =>
                    prev ? { ...prev, detail: e.target.value } : null,
                  )
                }
                rows={4}
                placeholder='Full editorial notice displayed at the top of the article page…'
              />
            </div>

            <div className='flex gap-2'>
              <Button
                type='button'
                className='bg-untele text-white hover:opacity-90'
                size='sm'
                disabled={!correction?.type || !correction?.issuedAt || !correction?.detail}
                onClick={() => setCorrectionOpen(false)}
              >
                Save Correction
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  setCorrection(null);
                  setCorrectionOpen(false);
                }}
              >
                Remove
              </Button>
            </div>
          </div>
        )}
        </div>
      </section>

      {/* ── Editor controls ──────────────────────────────────────────────── */}
      {isEditorPlus && (
        <>
          <Separator />
          <section className='space-y-4'>
            <h3 className='text-xs font-bold uppercase tracking-widest text-slate-500'>
              Editor controls
            </h3>
            <div className='flex items-center gap-3'>
              <Controller
                name='featured'
                control={control}
                render={({ field }) => (
                  <Switch
                    id='featured'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor='featured'>Featured Article</Label>
            </div>
            <div className='flex items-center gap-3'>
              <Controller
                name='breakingNews'
                control={control}
                render={({ field }) => (
                  <Switch
                    id='breakingNews'
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor='breakingNews'>Breaking News</Label>
            </div>
          </section>
        </>
      )}
    </form>

    {/* Floating pitch notes button */}
    {linkedPitch && (
      <>
        <button
          type='button'
          onClick={() => setShowPitchModal(true)}
          title='Open pitch notes'
          className='fixed bottom-8 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-untele shadow-lg ring-2 ring-white hover:opacity-90 dark:ring-slate-900'
        >
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
            <polyline points='14 2 14 8 20 8' />
            <line x1='16' y1='13' x2='8' y2='13' />
            <line x1='16' y1='17' x2='8' y2='17' />
            <polyline points='10 9 9 9 8 9' />
          </svg>
        </button>
        {showPitchModal && (
          <PitchQuickViewModal pitch={linkedPitch} onClose={() => setShowPitchModal(false)} />
        )}
      </>
    )}
    </>
  );
}
