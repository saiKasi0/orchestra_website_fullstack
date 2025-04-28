import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { awardsContentSchema } from "@/types/awards";
import { Achievement } from "@/types/awards"; // Import Achievement type
import { v4 as uuidv4 } from "uuid";
import { uploadBase64Image, deleteStorageObject } from '@/utils/imageUtils'; // Import utilities

// Helper function for generating formatted error responses
function formatErrorResponse(message: string, details: unknown = null, status = 500) {
  const errorId = uuidv4().substring(0, 8);
  console.error(`[ERROR ${errorId}] ${message}`, details);
  
  return NextResponse.json({ 
    error: message, 
    errorId,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' ? { details } : {})
  }, { status });
}

// GET endpoint for awards content
export async function GET() {
  const requestId = uuidv4().substring(0, 8);
  console.log(`[${requestId}] Processing GET request for awards content`);
  
  try {
    const supabase = createClient();
    
    // Query awards content
    console.log(`[${requestId}] Fetching awards content from database`);
    const { data: awardsData, error: awardsError } = await supabase
      .from('awards_content')
      .select('*')
      .single();
      
    if (awardsError) {
      console.error(`[${requestId}] Error fetching awards data:`, {
        code: awardsError.code,
        message: awardsError.message,
        details: awardsError.details
      });
      
      // If no record exists yet, return an empty structure
      if (awardsError.code === 'PGRST116') {
        console.log(`[${requestId}] No awards content found, returning empty structure`);
        return NextResponse.json({ 
          content: {
            id: null, // Indicate no existing content
            title: "Awards", // Default title
            description: "No description available.", // Default description
            achievements: [] // Empty achievements array
          },
          message: "No awards content found in the database.",
          requestId
        });
      }
      
      return formatErrorResponse("Failed to fetch awards content", awardsError, 500);
    }
    
    // Fetch achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('awards_achievements')
      .select('*')
      .eq('content_id', awardsData.id)
      .order('order_number', { ascending: true });
      
    if (achievementsError) {
      console.error(`[${requestId}] Error fetching achievements:`, {
        code: achievementsError.code,
        message: achievementsError.message,
        details: achievementsError.details,
        contentId: awardsData.id
      });
      // If content exists but achievements fail, return content with empty achievements
      return NextResponse.json({
        content: {
          ...awardsData,
          achievements: []
        },
        warning: "Failed to fetch achievements, returning content without them.",
        requestId
      });
    }
    
    // Combine the data and properly map database column names to camelCase
    const content = {
      ...awardsData,
      achievements: (achievements || []).map(achievement => ({
        id: achievement.id,
        title: achievement.title || "",
        imageSrc: achievement.imagesrc || "", // Convert from db column name
        imageAlt: achievement.imagealt || "", // Convert from db column name
        order_number: achievement.order_number 
      }))
    };
    
    console.log(`[${requestId}] Successfully fetched awards content with ${content.achievements.length} achievements`);
    console.log(`[${requestId}] First achievement sample:`, content.achievements.length > 0 ? {
      id: content.achievements[0].id,
      title: content.achievements[0].title.substring(0, 30) + (content.achievements[0].title.length > 30 ? '...' : ''),
      imageSrc: content.achievements[0].imageSrc.substring(0, 50) + (content.achievements[0].imageSrc.length > 50 ? '...' : ''),
      imageAlt: content.achievements[0].imageAlt.substring(0, 30) + (content.achievements[0].imageAlt.length > 30 ? '...' : '')
    } : 'No achievements');
    
    return NextResponse.json({ content, requestId });
    
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    };
    console.error(`[${requestId}] Unexpected error in awards content GET endpoint:`, errorDetails);
    return formatErrorResponse("An unexpected error occurred", errorDetails, 500);
  }
}

// PUT endpoint for awards content
export async function PUT(req: Request) {
  const requestId = uuidv4().substring(0, 8);
  console.log(`[${requestId}] Processing PUT request for awards content`);
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.warn(`[${requestId}] Unauthorized access attempt`);
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
    }
    
    console.log(`[${requestId}] Authenticated user: ${session.user.email}`);
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log(`[${requestId}] Request body parsed successfully`);
    } catch (parseError) {
      console.error(`[${requestId}] Error parsing request body:`, parseError);
      return formatErrorResponse("Invalid JSON in request body", parseError, 400);
    }
    
    // Validate the request body against our schema
    console.log(`[${requestId}] Validating request body against schema`);
    const validationResult = awardsContentSchema.safeParse(body.content);
    
    if (!validationResult.success) {
      console.error(`[${requestId}] Validation error:`, validationResult.error.format());
      return NextResponse.json(
        { 
          error: "Invalid data format", 
          details: validationResult.error.format(),
          requestId
        },
        { status: 400 }
      );
    }
    
    const content = validationResult.data;
    console.log(`[${requestId}] Validation successful. Content has ${content.achievements.length} achievements`);
    
    const supabase = createClient();
    
    // Fetch existing achievements to track images that might need to be deleted
    console.log(`[${requestId}] Fetching existing achievements to check for images to delete`);
    let imagesToDelete: string[] = [];
    
    if (content.id) {
      const { data: fetchedAchievements, error: fetchError } = await supabase
        .from('awards_achievements')
        .select('id, imagesrc') // Select ID and image source
        .eq('content_id', content.id);
        
      if (!fetchError && fetchedAchievements) {
        // Get all existing image URLs
        const existingImageUrls = fetchedAchievements.map(a => a.imagesrc).filter(Boolean);
        
        // Get all new image URLs that aren't base64 (these are existing URLs we're keeping)
        const keepingImageUrls = content.achievements
          .map(a => a.imageSrc)
          .filter(url => url && !url.startsWith('data:image/'));
        
        // Images to delete are those in existingImageUrls but not in keepingImageUrls
        imagesToDelete = existingImageUrls.filter(url => !keepingImageUrls.includes(url));
        
        console.log(`[${requestId}] Found ${imagesToDelete.length} images to potentially delete from storage`);
      } else if (fetchError) {
         console.error(`[${requestId}] Error fetching existing achievements for image deletion check:`, fetchError);
         // Continue without deleting images if fetch fails, but log the error
      }
    }
    
    // Process any base64 images before saving
    console.log(`[${requestId}] Processing achievement images`);
    const processedAchievements = [...content.achievements]; // Create a mutable copy
    for (let i = 0; i < processedAchievements.length; i++) {
      const achievement = processedAchievements[i];
      
      // Check if imageSrc is a base64 string and process it
      if (achievement.imageSrc && achievement.imageSrc.startsWith('data:image/')) {
        console.log(`[${requestId}] Processing base64 image for achievement ${i+1}`);
        // Use the utility function for upload
        const imageUrl = await uploadBase64Image(
          supabase,
          'achievement-images', // Bucket name
          achievement.imageSrc,
          'awards/', // Path prefix
          requestId
        );
        
        if (imageUrl) {
          processedAchievements[i].imageSrc = imageUrl; // Update the copy
          console.log(`[${requestId}] Image for achievement ${i+1} processed successfully`);
        } else {
          console.error(`[${requestId}] Failed to process image for achievement ${i+1}`);
          processedAchievements[i].imageSrc = ''; 
        }
      }
    }
    
    // Start transaction by updating or creating the main content record
    const contentId = content.id || uuidv4();
    
    // Update or insert the main content record
    console.log(`[${requestId}] Upserting main content record`);
    const { error: contentError } = await supabase
      .from('awards_content')
      .upsert({
        id: contentId,
        title: content.title,
        description: content.description,
        updated_at: new Date().toISOString()
      });
      
    if (contentError) {
      console.error(`[${requestId}] Error updating awards content:`, {
        code: contentError.code,
        message: contentError.message,
        details: contentError.details,
        contentId
      });
      return formatErrorResponse("Failed to update awards content", contentError, 500);
    }
    
    // SIMPLIFIED APPROACH: Delete all existing achievements for this content
    const { error: deleteError } = await supabase
      .from('awards_achievements')
      .delete()
      .eq('content_id', contentId);
      
    if (deleteError) {
      console.error(`[${requestId}] Error deleting existing achievements:`, {
        code: deleteError.code,
        message: deleteError.message,
        details: deleteError.details,
        contentId
      });
      return formatErrorResponse("Failed to delete existing achievements", deleteError, 500);
    }
    
    // Now delete the unused images from storage
    if (imagesToDelete.length > 0) {
      console.log(`[${requestId}] Deleting ${imagesToDelete.length} unused images from storage`);
      for (const imageUrl of imagesToDelete) {
        // Use the imported utility function
        await deleteStorageObject(supabase, 'achievement-images', imageUrl, requestId);
      }
    }
    
    // Prepare and insert the new set of achievements
    let insertedAchievements: Achievement[] = []; // To store the result with new IDs
    if (processedAchievements && processedAchievements.length > 0) {
      console.log(`[${requestId}] Preparing to insert ${processedAchievements.length} achievements`);
      
      // Prepare achievements for insertion, OMITTING ID
      const achievementsToInsert = processedAchievements.map((achievement, index) => {
        // Define the type for the object being inserted into the database
        const insertData: {
          content_id: string;
          title: string;
          imagesrc: string;
          imagealt: string;
          order_number: number;
        } = {
          content_id: contentId,
          title: achievement.title,
          imagesrc: achievement.imageSrc, 
          imagealt: achievement.imageAlt,   
          order_number: index + 1
        };

        return insertData; 
      });
      
      // Insert all achievements at once
      console.log(`[${requestId}] Inserting ${achievementsToInsert.length} achievements`);
      const { data: insertResult, error: insertError } = await supabase
        .from('awards_achievements')
        .insert(achievementsToInsert)
        .select(); // Select the inserted rows to get new IDs

      if (insertError) {
        console.error(`[${requestId}] Error inserting achievements:`, {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          contentId,
          count: achievementsToInsert.length
        });
        return formatErrorResponse("Failed to insert achievements", insertError, 500);
      }
      
// Map the inserted data back to the Achievement type
      if (insertResult) {
        insertedAchievements = insertResult.map(dbAch => ({
          id: dbAch.id, 
          title: dbAch.title,
          imageSrc: dbAch.imagesrc,
          imageAlt: dbAch.imagealt,
          order_number: dbAch.order_number
        }));
      }
      
    } else {
      console.log(`[${requestId}] No achievements to insert`);
    }
    
    console.log(`[${requestId}] Awards content updated successfully`);
    return NextResponse.json({ 
      success: true, 
      message: "Awards content updated successfully",
      contentId,
      updatedAchievements: insertedAchievements, // Return the achievements with new IDs
      requestId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId
    };
    console.error(`[${requestId}] Unexpected error updating awards content:`, errorDetails);
    return formatErrorResponse("An unexpected error occurred", errorDetails, 500);
  }
}
