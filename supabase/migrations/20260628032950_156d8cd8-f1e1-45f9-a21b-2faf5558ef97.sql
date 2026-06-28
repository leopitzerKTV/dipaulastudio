CREATE POLICY "Anyone can view timeline photos" ON storage.objects FOR SELECT USING (bucket_id = 'timeline-photos');
CREATE POLICY "Anyone can upload timeline photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'timeline-photos');
CREATE POLICY "Anyone can update timeline photos" ON storage.objects FOR UPDATE USING (bucket_id = 'timeline-photos') WITH CHECK (bucket_id = 'timeline-photos');
CREATE POLICY "Anyone can delete timeline photos" ON storage.objects FOR DELETE USING (bucket_id = 'timeline-photos');