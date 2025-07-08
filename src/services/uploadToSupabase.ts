// src/services/uploadToSupabase.ts
import RNFS from 'react-native-fs';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

export const uploadToSupabase = async (
  filePath: string,
  fileName: string,
  userId: string
) => {
  if (!supabase) throw new Error('Supabase client not initialized!');

  try {
    // 1. Read file as base64
    const base64 = await RNFS.readFile(filePath, 'base64');

    // 2. Convert to ArrayBuffer
    const arrayBuffer = decode(base64);

    // 3. Upload to Supabase Storage (public bucket)
    const { error } = await supabase.storage
      .from('pdf-by-user') // Your bucket name
      .upload(`${userId}/${fileName}`, arrayBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) throw error;

    // 4. Get public URL (no need for signed URLs since bucket is public)
    const { data: { publicUrl } } = supabase.storage
      .from('pdf-by-user')
      .getPublicUrl(`${userId}/${fileName}`);

    return publicUrl;
  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  }
};