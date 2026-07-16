-- Private storage buckets for My Little Studio.
-- Each object path must start with the owning parent's auth.uid(), e.g. "<uid>/<postId>/<file>".

insert into storage.buckets (id, name, public)
values
  ('profile-images', 'profile-images', false),
  ('post-images', 'post-images', false),
  ('post-audio', 'post-audio', false),
  ('post-videos', 'post-videos', false),
  ('fashion-renders', 'fashion-renders', false),
  ('exports', 'exports', false)
on conflict (id) do nothing;

-- Owner-scoped policies: the first path segment must equal the caller's uid.
do $$
declare
  bucket text;
begin
  foreach bucket in array array['profile-images','post-images','post-audio','post-videos','fashion-renders','exports']
  loop
    execute format(
      'create policy "%1$s owner select" on storage.objects for select using (bucket_id = %2$L and (storage.foldername(name))[1] = auth.uid()::text)',
      bucket || '_select', bucket
    );
    execute format(
      'create policy "%1$s owner insert" on storage.objects for insert with check (bucket_id = %2$L and (storage.foldername(name))[1] = auth.uid()::text)',
      bucket || '_insert', bucket
    );
    execute format(
      'create policy "%1$s owner update" on storage.objects for update using (bucket_id = %2$L and (storage.foldername(name))[1] = auth.uid()::text)',
      bucket || '_update', bucket
    );
    execute format(
      'create policy "%1$s owner delete" on storage.objects for delete using (bucket_id = %2$L and (storage.foldername(name))[1] = auth.uid()::text)',
      bucket || '_delete', bucket
    );
  end loop;
end $$;
