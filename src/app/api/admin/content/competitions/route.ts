import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { competitionsContentSchema } from "@/types/competitions";

// GET endpoint for competitions content
export async function GET() {
  try {
    const supabase = createClient();
    
    // First, get the page title and description
    const { data: pageContent, error: pageError } = await supabase
      .from('competitions_page')
      .select('*')
      .single();
      
    if (pageError) {
      console.error("Error fetching competitions page data:", pageError);
      
      // If no record exists, return default content
      if (pageError.code === 'PGRST116') {
        return NextResponse.json({
          content: {
            title: "Our Competitions",
            description: "Cypress Ranch Orchestra participates in various prestigious competitions, showcasing our students' talents and dedication to musical excellence.",
            competitions: []
          }
        });
      }
      
      return NextResponse.json({ error: "Failed to fetch competitions page data" }, { status: 500 });
    }
    
    // Now get the competitions
    const { data: competitions, error: competitionsError } = await supabase
      .from('competitions')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (competitionsError) {
      console.error("Error fetching competitions:", competitionsError);
      return NextResponse.json({ error: "Failed to fetch competitions" }, { status: 500 });
    }
    
    // For each competition, fetch its categories
    const competitionsWithCategories = await Promise.all(
      competitions.map(async (competition) => {
        const { data: categories, error: categoriesError } = await supabase
          .from('competition_categories')
          .select('name')
          .eq('competition_id', competition.id)
          .order('display_order', { ascending: true });
          
        if (categoriesError) {
          console.error(`Error fetching categories for competition ${competition.id}:`, categoriesError);
          return {
            id: competition.id,
            name: competition.name,
            description: competition.description,
            image: competition.image_url,
            categories: [],
            additionalInfo: competition.additional_info || ""
          };
        }
        
        return {
          id: competition.id,
          name: competition.name,
          description: competition.description,
          image: competition.image_url,
          categories: categories.map(c => c.name),
          additionalInfo: competition.additional_info || ""
        };
      })
    );
    
    return NextResponse.json({
      content: {
        title: pageContent.title,
        description: pageContent.description,
        competitions: competitionsWithCategories
      }
    });
    
  } catch (error) {
    console.error("Unexpected error in competitions GET endpoint:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// PUT endpoint for competitions content
export async function PUT(req: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only allow admin and leadership roles
    if (!["admin", "leadership"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const supabase = createClient();
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = competitionsContentSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid data format", details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const content = validationResult.data;
    
    // Update page title and description
    const { error: pageError } = await supabase
      .from('competitions_page')
      .upsert({
        id: 1, // Assuming single record for page content
        title: content.title,
        description: content.description,
        updated_at: new Date().toISOString()
      });
      
    if (pageError) {
      console.error("Error updating competitions page data:", pageError);
      return NextResponse.json({ error: "Failed to update page content" }, { status: 500 });
    }
    
    // Handle competitions updates - track IDs to determine what to delete later
    const existingCompetitionIds = [];
    
    // Process competitions one by one
    for (let i = 0; i < content.competitions.length; i++) {
      const competition = content.competitions[i];
      let competitionId = competition.id;
      
      // Check if this is an existing competition (numeric ID) or a new one
      const isExistingCompetition = !isNaN(Number(competitionId)) && competitionId !== "";
      
      if (isExistingCompetition) {
        // Update existing competition
        const { error: updateError } = await supabase
          .from('competitions')
          .update({
            name: competition.name,
            description: competition.description,
            image_url: competition.image,
            additional_info: competition.additionalInfo,
            display_order: i,
            updated_at: new Date().toISOString()
          })
          .eq('id', competitionId);
        
        if (updateError) {
          console.error(`Error updating competition ${competitionId}:`, updateError);
          return NextResponse.json({ error: "Failed to update competition data" }, { status: 500 });
        }
        
        existingCompetitionIds.push(competitionId);
      } else {
        // Insert new competition
        const { data: newComp, error: insertError } = await supabase
          .from('competitions')
          .insert({
            name: competition.name,
            description: competition.description,
            image_url: competition.image,
            additional_info: competition.additionalInfo,
            display_order: i,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();
          
        if (insertError || !newComp) {
          console.error("Error inserting new competition:", insertError);
          return NextResponse.json({ error: "Failed to create new competition" }, { status: 500 });
        }
        
        competitionId = newComp.id;
        existingCompetitionIds.push(competitionId);
      }
      
      // Delete existing categories for this competition
      const { error: deleteError } = await supabase
        .from('competition_categories')
        .delete()
        .eq('competition_id', competitionId);
        
      if (deleteError) {
        console.error(`Error deleting categories for competition ${competitionId}:`, deleteError);
        return NextResponse.json({ error: "Failed to update competition categories" }, { status: 500 });
      }
      
      // Insert new categories
      if (competition.categories && competition.categories.length > 0) {
        const categoryEntries = competition.categories.map((category, index) => ({
          competition_id: competitionId,
          name: category,
          display_order: index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('competition_categories')
          .insert(categoryEntries);
          
        if (insertError) {
          console.error(`Error inserting categories for competition ${competitionId}:`, insertError);
          return NextResponse.json({ error: "Failed to save competition categories" }, { status: 500 });
        }
      }
    }
    
    // Delete competitions that are no longer in the content
    if (existingCompetitionIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('competitions')
        .delete()
        .not('id', 'in', existingCompetitionIds);
        
      if (deleteError) {
        console.error("Error deleting removed competitions:", deleteError);
        // Not critical enough to fail the whole operation
      }
    } else if (content.competitions.length === 0) {
      // If no competitions were sent, delete all competitions
      const { error: deleteError } = await supabase
        .from('competitions')
        .delete()
        .gte('id', 0); // Delete all records
        
      if (deleteError) {
        console.error("Error deleting all competitions:", deleteError);
        // Not critical enough to fail the whole operation
      }
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Unexpected error in competitions PUT endpoint:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
