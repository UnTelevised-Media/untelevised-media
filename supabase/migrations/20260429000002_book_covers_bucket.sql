-- Create public book-covers storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'book-covers',
  'book-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public        = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

-- Public read — anyone can view cover images
create policy "book_covers_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'book-covers');

-- Service role only for writes
create policy "book_covers_service_insert"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'book-covers');

create policy "book_covers_service_update"
  on storage.objects for update
  to service_role
  using (bucket_id = 'book-covers');

create policy "book_covers_service_delete"
  on storage.objects for delete
  to service_role
  using (bucket_id = 'book-covers');
