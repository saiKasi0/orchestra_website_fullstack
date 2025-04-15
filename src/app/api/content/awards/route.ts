import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
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

// GET endpoint for public awards content
export async function GET() {
  const requestId = uuidv4().substring(0, 8);
  console.log(`[${requestId}] Processing public GET request for awards content`);
  
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
