import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET endpoint for awards content (public)
export async function GET() {
  try {
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
            title: "Cypress Ranch Orchestra's Achievements",
            description: "The Cypress Ranch Orchestra has consistently achieved remarkable success, earning a wide array of prestigious accolades across our various ensembles and competitions. From local and regional contests to state and national festivals, our orchestra's dedication to excellence has been recognized time and time again.",
            achievements: [
              {
                id: "1",
                title: "Most Area 27 Region Players in CFISD!",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/Region2023.jpg",
                imageAlt: "Cypress Ranch Orchestra Region players posing for a group photo"
              },
              {
                id: "2",
                title: "Varsity UIL Orchestra Division 1 Rating",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/Chamber2024Uil.jpg",
                imageAlt: "Varsity UIL Orchestra performing at UIL competition"
              },
              {
                id: "3",
                title: "Sub-Non-Varsity A UIL Orchestra Division 1 Rating",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/Symphony2024Uil.jpg",
                imageAlt: "Sub-Non-Varsity A UIL Orchestra performing at UIL competition"
              },
              {
                id: "4",
                title: "Festival Disney Golden Mickey & String Orchestra Best in Class",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/Disney2023.jpg",
                imageAlt: "Cypress Ranch Orchestra winning Golden Mickey at Disney event"
              },
              {
                id: "5",
                title: "Symphony - Commended Winner, Citation of Excellence 2024",
                imageSrc: "/CypressRanchOrchestraInstagramPhotos/SymphonyCitationOfExcellence.jpg",
                imageAlt: "Symphony orchestra receiving Citation of Excellence award"
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
