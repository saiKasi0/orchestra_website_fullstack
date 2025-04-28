import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { tripsContentSchema, GalleryImage, FeatureItem } from "@/types/trips";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { v4 as uuidv4 } from "uuid";
import { uploadBase64Image, deleteStorageObject } from '@/utils/imageUtils'; // Import new utilities

// Define specific types for error responses
type ErrorDetails = {
  requestId?: string;
  error?: unknown;
  supabaseError?: unknown;
  errorMessage?: string;
  errorStack?: string;
  originalError?: unknown;
  validationErrors?: unknown;
};

// Define specific type for image processing errors
type ImageProcessingError = {
  index: number;
  error: string | unknown;
  imagePreview?: string;
  stage?: string;
  value?: unknown;
  stack?: string;
};

// Helper function for structured error responses with limited information exposure
function errorResponse(message: string, details: ErrorDetails | null = null, status = 500) {
  // Log full error details on server side
  console.error(`Error: ${message}`, details);
  
  // Return limited information to client
  return NextResponse.json({
    error: message,
    timestamp: new Date().toISOString()
  }, { status });
}

// GET endpoint for trips content
export async function GET() {
  try {
    const requestId = uuidv4().substring(0, 8);
    console.log(`[${requestId}] Processing GET request for trips content`);
    
    const supabase = createClient();

    // First check if any trips content exists
    console.log(`[${requestId}] Checking if any trips content exists`);
    const { data: existingContents, error: checkError } = await supabase
      .from('trips_content')
      .select('*')
      .order('id', { ascending: true })
      .limit(1);
      
    let tripsData;
    
    // If no content exists, create initial record
    if (!checkError && (!existingContents || existingContents.length === 0)) {
      console.log(`[${requestId}] No trips content found, creating initial record`);
      
      // Create initial content WITHOUT specifying an ID (let DB auto-generate it)
      const { data: newContent, error: createError } = await supabase
        .from('trips_content')
        .insert({
          page_title: "Trips & Socials",
          page_subtitle: "Our Latest Adventures",
          quote: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error(`[${requestId}] Error creating initial trips content:`, createError);
        return errorResponse("Failed to create initial trips content", { requestId, error: createError }, 500);
      }
      
      tripsData = newContent;
      console.log(`[${requestId}] Created initial trips content with ID ${tripsData.id}`);
    } else if (checkError) {
      console.error(`[${requestId}] Error checking for existing trips content:`, checkError);
      return errorResponse("Failed to load content", { requestId, error: checkError }, 500);
    } else {
      // Use the first content record found
      tripsData = existingContents[0];
      console.log(`[${requestId}] Found existing trips content with ID ${tripsData.id}`);
    }

    let galleryImages: GalleryImage[] = [];
    let featureItems: FeatureItem[] = [];
    
    // Fetch gallery images - no filtering by UUID
    console.log(`[${requestId}] Fetching all gallery images`);
    try {
      const { data: fetchedGalleryImages, error: galleryError } = await supabase
        .from('trips_gallery_images')
        .select('*')
        .order('order_number', { ascending: true });

      if (galleryError) {
        console.error(`[${requestId}] Error fetching gallery images:`, galleryError);
        // Continue with empty gallery images but log the error
      } else {
        galleryImages = fetchedGalleryImages || [];
        console.log(`[${requestId}] Successfully fetched ${galleryImages.length} gallery images`);
      }
    } catch (galleryFetchError) {
      console.error(`[${requestId}] Unexpected error during gallery images fetch:`, galleryFetchError);
      // Continue with empty gallery images but log the error
    }

    // Fetch feature items - no filtering by UUID
    console.log(`[${requestId}] Fetching all feature items`);
    try {
      const { data: fetchedFeatureItems, error: featureError } = await supabase
        .from('trips_feature_items')
        .select('*')
        .order('order_number', { ascending: true });

      if (featureError) {
        console.error(`[${requestId}] Error fetching feature items:`, featureError);
        // Continue with empty feature items but log the error
      } else {
        featureItems = fetchedFeatureItems || [];
        console.log(`[${requestId}] Successfully fetched ${featureItems.length} feature items`);
      }
    } catch (featureFetchError) {
      console.error(`[${requestId}] Unexpected error during feature items fetch:`, featureFetchError);
      // Continue with empty feature items but log the error
    }

    // Format gallery images
    const formattedGalleryImages: GalleryImage[] = galleryImages.map(img => ({
      id: img.id,
      src: img.src || '',
      order_number: img.order_number
    }));

    // Format feature items
    const formattedFeatureItems: FeatureItem[] = featureItems.map(item => ({
      id: item.id,
      icon: item.icon,
      title: item.title || '',
      description: item.description || '',
      order_number: item.order_number
    }));

    // Combine the data
    const content = {
      ...tripsData,
      gallery_images: formattedGalleryImages,
      feature_items: formattedFeatureItems
    };

    console.log(`[${requestId}] Successfully completed GET request for trips content`);
    return NextResponse.json({ 
      content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorId = uuidv4().substring(0, 8);
    console.error(`[${errorId}] Unexpected error in trips content GET endpoint:`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Log detailed error information server-side but don't expose it
    console.error(`Details: ${errorMessage}`, errorStack);
    
    return errorResponse("An unexpected error occurred while loading content", null, 500);
  }
}

// PUT endpoint for trips content
export async function PUT(req: Request) {
  const requestId = uuidv4().substring(0, 8);
  console.log(`[${requestId}] Processing PUT request for trips content`);

  try {
    // Check authentication and authorization
    console.log(`[${requestId}] Verifying authentication and authorization`);
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.warn(`[${requestId}] Unauthorized - No session`);
      return errorResponse("Unauthorized", null, 401);
    }

    if (!["admin", "leadership"].includes(session.user?.role as string)) {
      console.warn(`[${requestId}] Unauthorized - User ${session.user?.email} with role ${session.user?.role}`);
      return errorResponse("Insufficient permissions", null, 403);
    }

    // Parse and validate the request body
    let body;
    try {
      body = await req.json();
      console.log(`[${requestId}] Request body parsed successfully`);
    } catch (parseError) {
      console.error(`[${requestId}] Error parsing request body:`, parseError);
      return errorResponse("Invalid request format", null, 400);
    }

    // Validate against schema
    console.log(`[${requestId}] Validating request body against schema`);
    const result = tripsContentSchema.safeParse(body);

    if (!result.success) {
      console.error(`[${requestId}] Validation error:`, result.error.format());
      return errorResponse("Invalid data submitted", null, 400);
    }

    const content = result.data;
    const supabase = createClient();

    // First check if any trips content record exists
    console.log(`[${requestId}] Checking if any trips content exists`);
    const { data: existingContents, error: checkError } = await supabase
      .from('trips_content')
      .select('id')
      .order('id', { ascending: true })
      .limit(1);

    let contentId;

    // Handle record existence
    if (checkError) {
      console.error(`[${requestId}] Error checking for existing trips content:`, checkError);
      return errorResponse("Failed to update content", null, 500);
    } else if (!existingContents || existingContents.length === 0) {
      // No record exists, create it WITHOUT specifying ID
      console.log(`[${requestId}] No trips content found, creating new record`);
      const { data: newRecord, error: insertError } = await supabase
        .from('trips_content')
        .insert({
          page_title: content.page_title,
          page_subtitle: content.page_subtitle,
          quote: content.quote,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (insertError) {
        console.error(`[${requestId}] Error creating trips content:`, insertError);
        return errorResponse("Failed to create content", null, 500);
      }
      
      contentId = newRecord.id;
      console.log(`[${requestId}] Created new trips content with ID ${contentId}`);
    } else {
      // Record exists, update it using the existing ID
      contentId = existingContents[0].id;
      console.log(`[${requestId}] Updating existing trips content record (ID: ${contentId})`);
      
      const { error: updateError } = await supabase
        .from('trips_content')
        .update({
          page_title: content.page_title,
          page_subtitle: content.page_subtitle,
          quote: content.quote,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (updateError) {
        console.error(`[${requestId}] Error updating trips content:`, updateError);
        return errorResponse("Failed to update content", null, 500);
      }
    }

    // --- Gallery Image Processing ---

    // 1. Fetch existing image URLs BEFORE modifying the table
    let oldImageUrls: string[] = [];
    console.log(`[${requestId}] Fetching existing gallery image URLs`);
    const { data: existingImages, error: fetchExistingError } = await supabase
      .from('trips_gallery_images')
      .select('src'); // Select only the source URL

    if (fetchExistingError) {
      console.error(`[${requestId}] Error fetching existing gallery images:`, fetchExistingError);
      return errorResponse("Failed to fetch existing gallery images for comparison", null, 500);
    } else if (existingImages) {
      oldImageUrls = existingImages.map(img => img.src).filter(Boolean); // Filter out null/empty URLs
      console.log(`[${requestId}] Found ${oldImageUrls.length} existing gallery image URLs.`);
    }

    // 2. Process incoming images (upload base64, keep existing URLs)
    console.log(`[${requestId}] Processing ${content.gallery_images?.length || 0} incoming gallery images`);
    const processedGalleryImagesInput: GalleryImage[] = []; // Store images with original IDs (temp or real)
    const imageProcessingErrors: ImageProcessingError[] = [];

    if (content.gallery_images && content.gallery_images.length > 0) {
      for (let i = 0; i < content.gallery_images.length; i++) {
        const image = content.gallery_images[i];
        let imageUrl = image.src;
        const originalId = image.id; // Keep track of original ID

        try {
          if (imageUrl && imageUrl.startsWith('data:image')) {
            console.log(`[${requestId}] Processing base64 image at index ${i}`);
            // Use the utility function for upload
            const uploadedUrl = await uploadBase64Image(
              supabase,
              'trips-gallery-images', // Bucket name
              imageUrl,
              'gallery_images/', // Path prefix within the bucket
              requestId
            );

            if (!uploadedUrl) {
              console.warn(`[${requestId}] Failed to upload base64 image at index ${i}`);
              imageProcessingErrors.push({
                index: i,
                error: "Failed to upload image",
                stage: 'upload'
              });
              continue; // Skip this image
            }
            imageUrl = uploadedUrl; // Update imageUrl with the returned public URL

          } else if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
            console.warn(`[${requestId}] Skipping gallery image at index ${i} with invalid or non-URL src: ${imageUrl}`);
            imageProcessingErrors.push({
              index: i,
              error: "Invalid or missing image source",
              value: imageUrl
            });
            continue;
          }

          processedGalleryImagesInput.push({
            id: originalId, // Keep original ID for now
            src: imageUrl,
            order_number: i // Use index as order number
          });

        } catch (imageError) {
          console.error(`[${requestId}] Error processing gallery image at index ${i}:`, imageError);
          imageProcessingErrors.push({
            index: i,
            error: imageError instanceof Error ? imageError.message : String(imageError)
          });
        }
      }
    }

    // 3. Determine which old images to delete from storage
    const finalImageUrls = new Set(processedGalleryImagesInput.map(img => img.src));
    const imagesToDeleteFromStorage = oldImageUrls.filter(
      oldUrl => oldUrl.includes('/trips-gallery-images/') && !finalImageUrls.has(oldUrl)
    );
    console.log(`[${requestId}] Identified ${imagesToDeleteFromStorage.length} images to delete from storage.`);

    // 4. Update the database: Delete all existing entries and insert the new ones
    console.log(`[${requestId}] Deleting all existing gallery image records from database`);
    try {
      const { error: deleteDbError } = await supabase
        .from('trips_gallery_images')
        .delete()
        .neq('id', 0);

      if (deleteDbError) {
        console.error(`[${requestId}] Error deleting existing gallery image records:`, deleteDbError);
        return errorResponse("Failed to update gallery image database records (delete step)", null, 500);
      }
    } catch (deleteError) {
      console.error(`[${requestId}] Unexpected error during gallery image DB deletion:`, deleteError);
      return errorResponse("Unexpected error during gallery image DB deletion", null, 500);
    }

    // Insert new gallery images records
    let insertedGalleryImages: GalleryImage[] = [];
    if (processedGalleryImagesInput.length > 0) {
      console.log(`[${requestId}] Inserting ${processedGalleryImagesInput.length} new gallery image records into database`);
      try {
        // Prepare for insertion, omitting temporary IDs
        const galleryImagesToInsert = processedGalleryImagesInput.map((image) => ({
          // id is omitted here to let DB generate it
          src: image.src,
          order_number: image.order_number
        }));

        const { data: insertResult, error: insertGalleryError } = await supabase
          .from('trips_gallery_images')
          .insert(galleryImagesToInsert)
          .select(); // Select to get new IDs

        if (insertGalleryError) {
          console.error(`[${requestId}] Error inserting new gallery image records:`, insertGalleryError);
          return errorResponse("Failed to save gallery image database records (insert step)", null, 500);
        }
        
        // Map result back to GalleryImage type
        if (insertResult) {
           insertedGalleryImages = insertResult.map(dbImg => ({
             id: dbImg.id,
             src: dbImg.src,
             order_number: dbImg.order_number
           }));
        }

      } catch (insertError) {
        console.error(`[${requestId}] Unexpected error during gallery image DB insertion:`, insertError);
        return errorResponse("Unexpected error during gallery image DB insertion", null, 500);
      }
    }

    // 5. Delete the identified old images from storage *after* DB operations seem successful
    if (imagesToDeleteFromStorage.length > 0) {
      console.log(`[${requestId}] Deleting ${imagesToDeleteFromStorage.length} images from storage...`);
      let deletionSuccessCount = 0;
      for (const imageUrlToDelete of imagesToDeleteFromStorage) {
        // Use the imported utility function
        const success = await deleteStorageObject(supabase, 'trips-gallery-images', imageUrlToDelete, requestId);
        if (success) {
          deletionSuccessCount++;
        } else {
           console.warn(`[${requestId}] Failed to delete image from storage: ${imageUrlToDelete}`);
           // Decide if this should be added to imageProcessingErrors or handled differently
        }
      }
      console.log(`[${requestId}] Finished storage deletion attempt. Successful/Skipped deletions: ${deletionSuccessCount}/${imagesToDeleteFromStorage.length}`);
    }

    // --- Feature Item Processing ---
    console.log(`[${requestId}] Deleting all existing feature items`);
    try {
      const { error: deleteFeatureError } = await supabase
        .from('trips_feature_items')
        .delete()
        .neq('id', 0);

      if (deleteFeatureError) {
        console.error(`[${requestId}] Error deleting existing feature items:`, deleteFeatureError);
        return errorResponse("Failed to update feature items", null, 500);
      }
    } catch (deleteError) {
      console.error(`[${requestId}] Unexpected error during feature items deletion:`, deleteError);
      return errorResponse("Unexpected error during feature items deletion", null, 500);
    }

    let insertedFeatureItems: FeatureItem[] = [];
    if (content.feature_items && content.feature_items.length > 0) {
      console.log(`[${requestId}] Inserting ${content.feature_items.length} new feature items`);
      try {
        // Prepare for insertion, omitting temporary IDs
        const featureItemsToInsert = content.feature_items.map((item, index) => ({
          // id is omitted here
          icon: item.icon,
          title: item.title,
          description: item.description,
          order_number: index
        }));

        const { data: insertResult, error: insertFeatureError } = await supabase
          .from('trips_feature_items')
          .insert(featureItemsToInsert)
          .select(); // Select to get new IDs

        if (insertFeatureError) {
          console.error(`[${requestId}] Error inserting new feature items:`, insertFeatureError);
          return errorResponse("Failed to update feature items", null, 500);
        }
        
        // Map result back to FeatureItem type
        if (insertResult) {
          insertedFeatureItems = insertResult.map(dbItem => ({
            id: dbItem.id,
            icon: dbItem.icon,
            title: dbItem.title,
            description: dbItem.description,
            order_number: dbItem.order_number
          }));
        }

      } catch (insertError) {
        console.error(`[${requestId}] Unexpected error during feature items insertion:`, insertError);
        return errorResponse("Unexpected error during feature items insertion", null, 500);
      }
    }

    // Log the update for audit purposes
    console.info(`[${requestId}] Trips content updated by ${session.user.email}`);

    if (imageProcessingErrors.length > 0) {
      console.warn(`[${requestId}] Completed PUT request with ${imageProcessingErrors.length} image processing warnings.`);
    }

    return NextResponse.json({
      success: true,
      message: "Content updated successfully",
      contentId: contentId,
      updatedGalleryImages: insertedGalleryImages, // Return updated gallery images
      updatedFeatureItems: insertedFeatureItems, // Return updated feature items
      imageProcessingWarnings: imageProcessingErrors.length > 0 ? imageProcessingErrors.length : undefined
    });

  } catch (error) {
    const errorId = uuidv4().substring(0, 8);
    console.error(`[${requestId || errorId}] Unexpected error in trips content PUT endpoint:`, error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error(`Error details: ${errorMessage}`, errorStack);
    
    return errorResponse("An unexpected error occurred", null, 500);
  }
}
