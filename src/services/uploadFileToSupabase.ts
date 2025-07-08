import RNFS from 'react-native-fs';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

const uploadFileToSupabase = async (filePath: string, userId: string) => {
  // Validate inputs
  if (!userId) throw new Error('User ID is required');
  if (!filePath) throw new Error('File path is required');
  if (!supabase) throw new Error('Supabase client not initialized');

  try {
    // 1. Read file as base64
    const base64 = await RNFS.readFile(filePath, 'base64');
    
    // 2. Convert directly to ArrayBuffer (more efficient than Blob in React Native)
    const arrayBuffer = decode(base64);

    // 3. Generate storage path with timestamp for uniqueness
    const timestamp = Date.now();
    const fileName = filePath.split('/').pop() ?? `upload_${timestamp}.pdf`;
    const storagePath = `${userId}/${fileName}`; // Removed redundant bucket name

    // 4. Upload with retry logic
    let uploadAttempts = 0;
    const maxAttempts = 3;
    let uploadError;

    while (uploadAttempts < maxAttempts) {
      try {
        const { error } = await supabase.storage
          .from('pdf-by-user')
          .upload(storagePath, arrayBuffer, {
            contentType: 'application/pdf',
            upsert: true,
            duplex: 'half' // Required for React Native
          });

        if (!error) break;
        uploadError = error;
      } finally {
        uploadAttempts++;
        if (uploadAttempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000 * uploadAttempts));
        }
      }
    }

    if (uploadError) throw uploadError;

    // 5. Get public URL (no need for signed URL if bucket is public)
    const { data: { publicUrl } } = supabase.storage
      .from('pdf-by-user')
      .getPublicUrl(storagePath);

    return publicUrl;
  } catch (err) {
    console.error('❌ Supabase Upload Error:', err);
    throw err; // Re-throw for caller to handle
  }
};

export default uploadFileToSupabase;