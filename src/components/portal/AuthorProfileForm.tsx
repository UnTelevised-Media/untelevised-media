// src/components/portal/AuthorProfileForm.tsx
// Editable author profile form — connected to the Sanity author document.
'use client';

import { useState, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { updateMyProfile, type AuthorProfileInput } from '@/lib/portal/author-actions';
import { uploadImageToSanity } from '@/lib/portal/image-actions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthorProfile {
  _id: string;
  name: string;
  slug?: string;
  title?: string;
  bio?: Array<{ _type: string; children?: Array<{ text: string }> }>;
  location?: string;
  email?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  website?: string;
  credentials?: string[];
  expertise?: string[];
  sameAs?: string[];
  image?: { asset?: { _id?: string; url?: string }; alt?: string };
}

interface Props {
  profile: AuthorProfile;
}

// ---------------------------------------------------------------------------
// Helper: extract plain text from portable text bio
// ---------------------------------------------------------------------------

function bioToText(bio?: AuthorProfile['bio']): string {
  if (!bio?.length) return '';
  return bio
    .filter((b) => b._type === 'block')
    .map((b) => b.children?.map((c) => c.text).join('') ?? '')
    .join('\n\n');
}

// ---------------------------------------------------------------------------
// Tag input
// ---------------------------------------------------------------------------

function TagInput({
  label,
  description,
  tags,
  onChange,
}: {
  label: string;
  description?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function add() {
    const vals = input
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v && !tags.includes(v));
    if (vals.length) onChange([...tags, ...vals]);
    setInput('');
  }

  return (
    <div>
      <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>{label}</Label>
      {description && <p className='mb-2 text-xs text-slate-400'>{description}</p>}
      <div className='flex gap-2'>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add();
            }
          }}
          placeholder='Type and press Enter or comma to add…'
          className='flex-1'
        />
        <Button type='button' variant='outline' size='sm' onClick={add}>
          Add
        </Button>
      </div>
      {tags.length > 0 && (
        <div className='mt-2 flex flex-wrap gap-1'>
          {tags.map((tag) => (
            <Badge
              key={tag}
              className='cursor-pointer bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-700 dark:bg-slate-800 dark:text-slate-300'
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              title='Click to remove'
            >
              {tag} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// URL list input
// ---------------------------------------------------------------------------

function UrlListInput({
  label,
  description,
  urls,
  onChange,
}: {
  label: string;
  description?: string;
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function add() {
    const val = input.trim();
    if (val && !urls.includes(val)) onChange([...urls, val]);
    setInput('');
  }

  return (
    <div>
      <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>{label}</Label>
      {description && <p className='mb-2 text-xs text-slate-400'>{description}</p>}
      <div className='flex gap-2'>
        <Input
          type='url'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder='https://…'
          className='flex-1'
        />
        <Button type='button' variant='outline' size='sm' onClick={add}>
          Add
        </Button>
      </div>
      {urls.length > 0 && (
        <ul className='mt-2 space-y-1'>
          {urls.map((url) => (
            <li key={url} className='flex items-center justify-between gap-2 text-xs'>
              <span className='truncate text-slate-600 dark:text-slate-400'>{url}</span>
              <button
                type='button'
                onClick={() => onChange(urls.filter((u) => u !== url))}
                className='shrink-0 text-red-500 hover:text-red-700'
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main form
// ---------------------------------------------------------------------------

export default function AuthorProfileForm({ profile }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form state
  const [name, setName] = useState(profile.name ?? '');
  const [title, setTitle] = useState(profile.title ?? '');
  const [bioText, setBioText] = useState(bioToText(profile.bio));
  const [location, setLocation] = useState(profile.location ?? '');
  const [email, setEmail] = useState(profile.email ?? '');
  const [twitter, setTwitter] = useState(profile.twitter ?? '');
  const [instagram, setInstagram] = useState(profile.instagram ?? '');
  const [facebook, setFacebook] = useState(profile.facebook ?? '');
  const [tiktok, setTiktok] = useState(profile.tiktok ?? '');
  const [youtube, setYoutube] = useState(profile.youtube ?? '');
  const [linkedin, setLinkedin] = useState(profile.linkedin ?? '');
  const [website, setWebsite] = useState(profile.website ?? '');
  const [credentials, setCredentials] = useState<string[]>(profile.credentials ?? []);
  const [expertise, setExpertise] = useState<string[]>(profile.expertise ?? []);
  const [sameAs, setSameAs] = useState<string[]>(profile.sameAs ?? []);

  // Avatar state
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    profile.image?.asset?.url,
  );
  const [newImageRef, setNewImageRef] = useState<string | undefined>();
  const [imageAlt, setImageAlt] = useState(profile.image?.alt ?? '');

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadImageToSanity(fd);
      if (result.success) {
        setNewImageRef(result.assetId);
        setAvatarPreview(URL.createObjectURL(file));
        toast.success('Avatar uploaded — save your profile to apply it.');
      } else {
        toast.error(result.error ?? 'Avatar upload failed.');
      }
    } catch {
      toast.error('Avatar upload failed.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  function handleSave() {
    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }

    const input: AuthorProfileInput = {
      name,
      title: title || undefined,
      bioText: bioText || undefined,
      location: location || undefined,
      email: email || undefined,
      twitter: twitter || undefined,
      instagram: instagram || undefined,
      facebook: facebook || undefined,
      tiktok: tiktok || undefined,
      youtube: youtube || undefined,
      linkedin: linkedin || undefined,
      website: website || undefined,
      credentials,
      expertise,
      sameAs,
      imageRef: newImageRef,
      imageAlt: imageAlt || name,
    };

    startTransition(async () => {
      const result = await updateMyProfile(input);
      if (result.success) {
        toast.success('Profile saved.');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  const avatarUrl = avatarPreview
    ? `${avatarPreview}${avatarPreview.startsWith('blob:') ? '' : '?w=160&h=160&fit=crop&auto=format'}`
    : undefined;

  return (
    <div className='space-y-8'>
      {/* ── Avatar ───────────────────────────────────────────────────────── */}
      <section>
        <h2 className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-500'>Avatar</h2>
        <div className='flex items-center gap-6'>
          <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800'>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className='h-full w-full object-cover' />
            ) : (
              <span className='flex h-full w-full items-center justify-center text-3xl font-black text-slate-400'>
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className='space-y-2'>
            <input
              ref={fileInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleAvatarChange}
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingAvatar ? 'Uploading…' : 'Change photo'}
            </Button>
            {avatarUrl && (
              <div>
                <Label className='mb-1 block text-xs font-bold uppercase tracking-widest'>
                  Alt text
                </Label>
                <Input
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder='Describe the photo for screen readers'
                  className='h-7 text-xs'
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Basic info ───────────────────────────────────────────────────── */}
      <section>
        <h2 className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-500'>
          Basic Info
        </h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div>
            <Label htmlFor='name' className='mb-1 block text-xs font-bold uppercase tracking-widest'>
              Display name <span className='text-untele'>*</span>
            </Label>
            <Input id='name' value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label
              htmlFor='title'
              className='mb-1 block text-xs font-bold uppercase tracking-widest'
            >
              Job title
            </Label>
            <Input
              id='title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Investigative Reporter'
            />
          </div>
          <div>
            <Label
              htmlFor='location'
              className='mb-1 block text-xs font-bold uppercase tracking-widest'
            >
              Location
            </Label>
            <Input
              id='location'
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder='Atlanta, GA'
            />
          </div>
          <div>
            <Label
              htmlFor='email'
              className='mb-1 block text-xs font-bold uppercase tracking-widest'
            >
              Email
            </Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@example.com'
            />
          </div>
        </div>

        {profile.slug && (
          <p className='mt-3 text-xs text-slate-400'>
            Public profile:{' '}
            <a
              href={`/author/${profile.slug}`}
              target='_blank'
              rel='noopener noreferrer'
              className='text-untele hover:underline'
            >
              /author/{profile.slug}
            </a>
          </p>
        )}
      </section>

      <Separator />

      {/* ── Bio ──────────────────────────────────────────────────────────── */}
      <section>
        <h2 className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-500'>Bio</h2>
        <Textarea
          id='bio'
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          rows={5}
          placeholder='Write a short bio about yourself…'
        />
        <p className='mt-1 text-xs text-slate-400'>
          Separate paragraphs with a blank line. ({bioText.length}/2000)
        </p>
      </section>

      <Separator />

      {/* ── Credentials & Expertise ──────────────────────────────────────── */}
      <section>
        <h2 className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-500'>
          Credentials &amp; Expertise
        </h2>
        <div className='space-y-5'>
          <TagInput
            label='Credentials'
            description='Professional credentials that establish your authority (e.g. "Investigative Journalist", "J-School Graduate")'
            tags={credentials}
            onChange={setCredentials}
          />
          <TagInput
            label='Areas of expertise'
            description='Topics you cover (e.g. "Criminal Justice", "Housing Policy")'
            tags={expertise}
            onChange={setExpertise}
          />
        </div>
      </section>

      <Separator />

      {/* ── Social links ─────────────────────────────────────────────────── */}
      <section>
        <h2 className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-500'>
          Social &amp; Contact Links
        </h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          {[
            { id: 'twitter', label: 'X / Twitter', value: twitter, set: setTwitter, placeholder: '@handle' },
            { id: 'instagram', label: 'Instagram', value: instagram, set: setInstagram, placeholder: '@handle' },
            { id: 'tiktok', label: 'TikTok', value: tiktok, set: setTiktok, placeholder: '@handle' },
            { id: 'facebook', label: 'Facebook', value: facebook, set: setFacebook, placeholder: 'Profile URL or username' },
            { id: 'youtube', label: 'YouTube', value: youtube, set: setYoutube, placeholder: 'Channel URL' },
            { id: 'linkedin', label: 'LinkedIn', value: linkedin, set: setLinkedin, placeholder: 'Profile URL' },
            { id: 'website', label: 'Website', value: website, set: setWebsite, placeholder: 'https://yoursite.com' },
          ].map(({ id, label, value, set, placeholder }) => (
            <div key={id}>
              <Label
                htmlFor={id}
                className='mb-1 block text-xs font-bold uppercase tracking-widest'
              >
                {label}
              </Label>
              <Input
                id={id}
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Identity URLs (sameAs) ───────────────────────────────────────── */}
      <section>
        <h2 className='mb-4 text-xs font-bold uppercase tracking-widest text-slate-500'>
          Profile URLs
        </h2>
        <UrlListInput
          label='sameAs links'
          description='External pages that confirm your identity (LinkedIn, Wikipedia, journalism profiles, etc.) — used for structured data'
          urls={sameAs}
          onChange={setSameAs}
        />
      </section>

      <Separator />

      {/* ── Save ─────────────────────────────────────────────────────────── */}
      <div className='flex items-center gap-3 pb-8'>
        <Button
          type='button'
          className='bg-untele text-white hover:opacity-90'
          disabled={isPending || uploadingAvatar}
          onClick={handleSave}
        >
          {isPending ? 'Saving…' : 'Save profile'}
        </Button>
        <a
          href={profile.slug ? `/author/${profile.slug}` : '#'}
          target='_blank'
          rel='noopener noreferrer'
          className='text-xs text-slate-500 hover:text-untele'
        >
          View public profile ↗
        </a>
      </div>
    </div>
  );
}
