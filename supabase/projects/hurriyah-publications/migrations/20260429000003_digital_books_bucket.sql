-- Create private digital-books storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'digital-books',
  'digital-books',
  false,
  524288000, -- 500 MB
  null       -- no MIME restriction — PDF, EPUB, MOBI, AZW3, ZIP all accepted
)
on conflict (id) do update set
  public          = false,
  file_size_limit = 524288000,
  allowed_mime_types = null;
