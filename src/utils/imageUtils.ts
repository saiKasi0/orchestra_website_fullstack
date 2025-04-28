import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from "uuid";
import { Buffer } from 'buffer';

/**
 * Uploads a base64 encoded image to a Supabase storage bucket.
 * @param supabase - The Supabase client instance.
 * @param bucketName - The name of the storage bucket.
 * @param base64String - The base64 encoded image string (e.g., "data:image/png;base64,...").
 * @param pathPrefix - Optional prefix for the storage path (e.g., "gallery_images/").
 * @param requestId - Optional request ID for logging.
 * @returns The public URL of the uploaded image, or null if an error occurred.
 */
export async function uploadBase64Image(
  supabase: SupabaseClient,
  bucketName: string,
  base64String: string,
  pathPrefix: string = '',
  requestId?: string
): Promise<string | null> {
  const logPrefix = requestId ? `[${requestId}] ` : '';
  console.log(`${logPrefix}Attempting to upload base64 image to bucket: ${bucketName}`);

  if (!base64String || !base64String.startsWith('data:image')) {
    console.error(`${logPrefix}Invalid base64 string provided.`);
    return null;
  }

  const base64Pattern = /^data:image\/(\w+);base64,(.+)$/;
  const matches = base64String.match(base64Pattern);

  if (!matches || matches.length !== 3) {
    console.error(`${logPrefix}Invalid base64 image format.`);
    return null;
  }

  const imageType = matches[1];
  const base64Data = matches[2];
  const binaryData = Buffer.from(base64Data, 'base64');
  const filename = `${uuidv4()}.${imageType}`;
  const filePath = `${pathPrefix}${filename}`; // Ensure prefix ends with '/' if needed

  console.log(`${logPrefix}Uploading image to storage: ${filePath}`);
  try {
    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, binaryData, { contentType: `image/${imageType}`, upsert: true });

    if (uploadError) {
      console.error(`${logPrefix}Error uploading image:`, uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    console.log(`${logPrefix}Image uploaded successfully, URL: ${urlData.publicUrl}`);
    return urlData.publicUrl;

  } catch (error) {
    console.error(`${logPrefix}Unexpected error during image upload:`, error);
    return null;
  }
}

/**
 * Deletes an object from a Supabase storage bucket using its public URL.
 * @param supabase - The Supabase client instance.
 * @param bucketName - The name of the storage bucket.
 * @param publicUrl - The public URL of the object to delete.
 * @param requestId - Optional request ID for logging.
 * @returns True if deletion was successful or skipped, false otherwise.
 */
export async function deleteStorageObject(
  supabase: SupabaseClient,
  bucketName: string,
  publicUrl: string | null | undefined,
  requestId?: string
): Promise<boolean> {
  const logPrefix = requestId ? `[${requestId}] ` : '';

  if (!publicUrl || !publicUrl.includes(`/${bucketName}/`)) {
    console.log(`${logPrefix}Skipping deletion for non-storage or invalid URL: ${publicUrl}`);
    return true; // Treat as success if not a valid storage URL for this bucket
  }

  try {
    const url = new URL(publicUrl);
    const pathSegments = url.pathname.split('/');
    const bucketNameIndex = pathSegments.findIndex(segment => segment === bucketName);

    if (bucketNameIndex === -1 || bucketNameIndex >= pathSegments.length - 1) {
      console.error(`${logPrefix}Could not extract path relative to bucket '${bucketName}' from URL: ${publicUrl}`);
      return false;
    }

    const storagePath = pathSegments.slice(bucketNameIndex + 1).join('/');

    if (!storagePath) {
      console.error(`${logPrefix}Empty storage path extracted for URL: ${publicUrl}`);
      return false;
    }

    console.log(`${logPrefix}Attempting to delete object from bucket '${bucketName}' at path: ${storagePath}`);
    const { error } = await supabase.storage.from(bucketName).remove([storagePath]);

    if (error) {
      // Log as warning, as sometimes files might be manually deleted or not exist
      console.warn(`${logPrefix}Warning/Error deleting object '${storagePath}' from bucket '${bucketName}':`, error.message);
      // Depending on strictness, you might return false here.
      // Returning true allows the process to continue even if a file is already gone.
      return true;
    }

    console.log(`${logPrefix}Successfully deleted object '${storagePath}' from bucket '${bucketName}'.`);
    return true;
  } catch (e) {
    console.error(`${logPrefix}Error processing URL or deleting object for URL ${publicUrl}:`, e);
    return false;
  }
}
