-- Files are stored under <uploader_id>/<report_id>/<filename>
CREATE POLICY "Users upload report media into own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'report-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Participants read report media" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'report-media'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_staff(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.report_media m
        JOIN public.reports r ON r.id = m.report_id
        WHERE m.storage_path = name AND r.assigned_to = auth.uid()
      )
    )
  );

CREATE POLICY "Users delete own report media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'report-media' AND (storage.foldername(name))[1] = auth.uid()::text);