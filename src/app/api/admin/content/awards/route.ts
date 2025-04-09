import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { awardsContentSchema } from "@/types/awards";
import { v4 as uuidv4 } from "uuid";

// GET endpoint for awards content
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const supabase = createClient();
    
    // Query awards content
    const { data: awardsData, error: awardsError } = await supabase
      .from('awards_content')
      .select('*')
      .single();
      
    if (awardsError) {
      console.error("Error fetching awards data:", awardsError);
      
      // If no record exists yet, return default values
      if (awardsError.code === 'PGRST116') {
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
          }
        });
      }
      
      return NextResponse.json({ error: "Failed to fetch awards content" }, { status: 500 });
    }
    
    // Fetch achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('awards_achievements')
      .select('*')
      .eq('content_id', awardsData.id)
      .order('order_number', { ascending: true });
      
    if (achievementsError) {
      console.error("Error fetching achievements:", achievementsError);
      return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
    }
    
    // Combine the data
    const content = {
      ...awardsData,
      achievements: achievements || []
    };
    
    return NextResponse.json({ content });
    
  } catch (error) {
    console.error("Unexpected error in awards content GET endpoint:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// PUT endpoint for awards content
export async function PUT(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate the request body against our schema
    const validationResult = awardsContentSchema.safeParse(body.content);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data format", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const content = validationResult.data;
    const supabase = createClient();
    
    // Start transaction by updating or creating the main content record
    const contentId = content.id || uuidv4();
    
    // Update or insert the main content record
    const { error: contentError } = await supabase
      .from('awards_content')
      .upsert({
        id: contentId,
        title: content.title,
        description: content.description,
        updated_at: new Date().toISOString()
      });
      
    if (contentError) {
      console.error("Error updating awards content:", contentError);
      return NextResponse.json({ error: "Failed to update awards content" }, { status: 500 });
    }
    
    // Get existing achievements to compare
    const { data: existingAchievements, error: fetchError } = await supabase
      .from('awards_achievements')
      .select('id')
      .eq('content_id', contentId);
      
    if (fetchError) {
      console.error("Error fetching existing achievements:", fetchError);
      return NextResponse.json({ error: "Failed to fetch existing achievements" }, { status: 500 });
    }
    
    // Create a set of existing achievement IDs for quick lookup
    const existingIds = new Set(existingAchievements?.map(item => item.id) || []);
    
    // Process achievement items
    if (content.achievements && content.achievements.length > 0) {
      // Track which IDs we're going to keep
      const newAchievementIds = new Set(content.achievements.map(a => a.id));
      
      // Delete achievements that are no longer present
      const idsToDelete = Array.from(existingIds).filter(id => !newAchievementIds.has(id as string));
      
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('awards_achievements')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) {
          console.error("Error deleting achievements:", deleteError);
          return NextResponse.json({ error: "Failed to delete removed achievements" }, { status: 500 });
        }
      }
      
      // Upsert all achievement items with order numbers
      const achievementsWithOrder = content.achievements.map((achievement, index) => ({
        ...achievement,
        content_id: contentId,
        order_number: achievement.order_number !== undefined ? achievement.order_number : index + 1
      }));
      
      const { error: achievementsError } = await supabase
        .from('awards_achievements')
        .upsert(achievementsWithOrder);
        
      if (achievementsError) {
        console.error("Error upserting achievements:", achievementsError);
        return NextResponse.json({ error: "Failed to update achievements" }, { status: 500 });
      }
    } else {
      // If no achievements are provided, delete all existing ones
      if (existingIds.size > 0) {
        const { error: deleteAllError } = await supabase
          .from('awards_achievements')
          .delete()
          .eq('content_id', contentId);
          
        if (deleteAllError) {
          console.error("Error deleting all achievements:", deleteAllError);
          return NextResponse.json({ error: "Failed to delete all achievements" }, { status: 500 });
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Awards content updated successfully",
      contentId
    });
    
  } catch (error) {
    console.error("Unexpected error updating awards content:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
