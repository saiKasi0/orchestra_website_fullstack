import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { awardsContentSchema } from "@/types/awards";
import { v4 as uuidv4 } from "uuid";

// Helper function for generating formatted error responses
function formatErrorResponse(message: string, details: any = null, status = 500) {
  const errorId = uuidv4().substring(0, 8);
  console.error(`[ERROR ${errorId}] ${message}`, details);
  
  return NextResponse.json({ 
    error: message, 
    errorId,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' ? { details } : {})
  }, { status });
}

// Helper function to process base64 images
async function processBase64Image(base64String: string, requestId: string, supabase: any): Promise<string | null> {
  try {
    // Check if the string is a base64 image
    if (!base64String.startsWith('data:image/')) {
      return base64String; // Not a base64 image, return as is
    }

    console.log(`[${requestId}] Processing base64 image upload`);
    
    // Extract mime type and actual base64 data
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      console.error(`[${requestId}] Invalid base64 string format`);
      return null;
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const imageExtension = mimeType.split('/')[1];
    
    // Convert base64 to binary
    const binaryData = Buffer.from(base64Data, 'base64');
    
    // Generate a unique filename
    const filename = `achievement-${uuidv4()}.${imageExtension}`;
    
    // Define the path in the storage bucket
    const filePath = `awards/${filename}`;
    
    // Upload to Supabase storage
    console.log(`[${requestId}] Uploading image to storage bucket at path: ${filePath}`);
    const { error: uploadError } = await supabase
      .storage
      .from('achievement-images')
      .upload(filePath, binaryData, {
        contentType: mimeType,
        upsert: true
      });
    
    if (uploadError) {
      console.error(`[${requestId}] Error uploading image to storage:`, uploadError);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('achievement-images')
      .getPublicUrl(filePath);
    
    console.log(`[${requestId}] Image uploaded successfully, URL: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`[${requestId}] Error processing base64 image:`, error);
    return null;
  }
}

// GET endpoint for awards content
export async function GET() {
  const requestId = uuidv4().substring(0, 8);
  console.log(`[${requestId}] Processing GET request for awards content`);
  
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      console.warn(`[${requestId}] Unauthorized access attempt`);
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
    }
    
    console.log(`[${requestId}] Authenticated user: ${session.user.email}`);
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
      
      // If no record exists yet, return default values
      if (awardsError.code === 'PGRST116') {
        console.log(`[${requestId}] No awards content found, returning default values`);
        return NextResponse.json({ 
          content: {
            id: uuidv4(),
            title: "Cypress Ranch Orchestra's Achievements",
            description: "The Cypress Ranch Orchestra has consistently achieved remarkable success, earning a wide array of prestigious accolades across our various ensembles and competitions. From local and regional contests to state and national festivals, our orchestra's dedication to excellence has been recognized time and time again.",
            achievements: [
              {
                id: "1",
                title: "Most Area 27 Region Players in CFISD!",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/Region2023.jpg",
                imageAlt: "Cypress Ranch Orchestra Region players posing for a group photo",
                order_number: 1
              },
              {
                id: "2",
                title: "Varsity UIL Orchestra Division 1 Rating",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/Chamber2024Uil.jpg",
                imageAlt: "Varsity UIL Orchestra performing at UIL competition",
                order_number: 2
              },
              {
                id: "3",
                title: "Sub-Non-Varsity A UIL Orchestra Division 1 Rating",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/Symphony2024Uil.jpg",
                imageAlt: "Sub-Non-Varsity A UIL Orchestra performing at UIL competition",
                order_number: 3
              },
              {
                id: "4",
                title: "Festival Disney Golden Mickey & String Orchestra Best in Class",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/Disney2023.jpg",
                imageAlt: "Cypress Ranch Orchestra winning Golden Mickey at Disney event",
                order_number: 4
              },
              {
                id: "5",
                title: "Symphony - Commended Winner, Citation of Excellence 2024",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/SymphonyCitationOfExcellence.jpg",
                imageAlt: "Symphony orchestra receiving Citation of Excellence award",
                order_number: 5
              }
            ]
          },
          requestId
        });
      }
      
      return formatErrorResponse("Failed to fetch awards content", awardsError, 500);
    }
    
    // Fetch achievements
    console.log(`[${requestId}] Fetching achievements for content ID: ${awardsData.id}`);
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
      return formatErrorResponse("Failed to fetch achievements", achievementsError, 500);
    }
    
    // Combine the data and properly map database column names to camelCase
    const content = {
      ...awardsData,
      achievements: (achievements || []).map(achievement => ({
        id: achievement.id || `achievement-${Date.now()}-${Math.random()}`,
        title: achievement.title || "",
        imageSrc: achievement.imagesrc || "", // Convert from db column name
        imageAlt: achievement.imagealt || "", // Convert from db column name
        order_number: achievement.order_number || 0
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
    
    // Process any base64 images before saving
    console.log(`[${requestId}] Processing achievement images`);
    for (let i = 0; i < content.achievements.length; i++) {
      const achievement = content.achievements[i];
      
      // Check if imageSrc is a base64 string and process it
      if (achievement.imageSrc && achievement.imageSrc.startsWith('data:image/')) {
        console.log(`[${requestId}] Processing base64 image for achievement ${i+1}`);
        const imageUrl = await processBase64Image(achievement.imageSrc, requestId, supabase);
        
        if (imageUrl) {
          content.achievements[i].imageSrc = imageUrl;
          console.log(`[${requestId}] Image for achievement ${i+1} processed successfully`);
        } else {
          console.error(`[${requestId}] Failed to process image for achievement ${i+1}`);
          return formatErrorResponse("Failed to process one or more images", null, 500);
        }
      }
    }
    
    // Start transaction by updating or creating the main content record
    const contentId = content.id || uuidv4();
    console.log(`[${requestId}] Working with content ID: ${contentId} (${content.id ? 'existing' : 'new'})`);
    
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
    console.log(`[${requestId}] Deleting all existing achievements for content ID: ${contentId}`);
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
    
    // If there are new achievements to add, insert them all at once
    if (content.achievements && content.achievements.length > 0) {
      // Prepare achievements with content_id and order_number
      console.log(`[${requestId}] Preparing to insert ${content.achievements.length} achievements`);
      const achievementsToInsert = content.achievements.map((achievement, index) => ({
        id: achievement.id,
        content_id: contentId,
        title: achievement.title,
        imagesrc: achievement.imageSrc, // Note: column name is lowercase in DB
        imagealt: achievement.imageAlt, // Note: column name is lowercase in DB
        order_number: index + 1 // Use the array index to set order
      }));
      
      // Log the first achievement as a sample for debugging
      if (achievementsToInsert.length > 0) {
        console.log(`[${requestId}] First achievement sample:`, {
          ...achievementsToInsert[0],
          title: achievementsToInsert[0].title.substring(0, 30) + (achievementsToInsert[0].title.length > 30 ? '...' : '')
        });
      }
      
      // Insert all achievements at once
      console.log(`[${requestId}] Inserting ${achievementsToInsert.length} achievements`);
      const { error: insertError } = await supabase
        .from('awards_achievements')
        .insert(achievementsToInsert);
        
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
    } else {
      console.log(`[${requestId}] No achievements to insert`);
    }
    
    console.log(`[${requestId}] Awards content updated successfully`);
    return NextResponse.json({ 
      success: true, 
      message: "Awards content updated successfully",
      contentId,
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
