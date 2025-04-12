import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { resourcesContentSchema } from "@/types/resources";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// GET endpoint for resources content
export async function GET() {
  try {
    const supabase = createClient();
    
    // Query resources content
    const { data, error } = await supabase
      .from('resources_content')
      .select('*')
      .single();
      
    if (error) {
      console.error("Error fetching resources content:", error);
      
      // If no record exists yet, return default values
      if (error.code === 'PGRST116') {
        return NextResponse.json({ 
          content: {
            calendar_url: "https://calendar.google.com/calendar/embed?src=c_20p6293m4hda8ecdv1k63ki418%40group.calendar.google.com&amp",
            support_title: "Just For Some Support :)",
            youtube_url: "https://www.youtube.com/embed/QkklAQLhnQY?si=HGTk2aKkxV3r1ITb"
          }
        });
      }
      
      return NextResponse.json({ error: "Failed to fetch resources content" }, { status: 500 });
    }
    
    return NextResponse.json({ content: data });
    
  } catch (error) {
    console.error("Unexpected error in resources content GET endpoint:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// PUT endpoint for resources content
export async function PUT(req: Request) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }
    
    if (!["admin", "leadership"].includes(session.user?.role as string)) {
      return NextResponse.json({ error: "Unauthorized - Insufficient permissions" }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    
    // Perform validation
    const result = resourcesContentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: result.error.format() 
      }, { status: 400 });
    }
    
    const content = result.data;
    
    // Create Supabase client
    const supabase = createClient();
    
    // Check if a record already exists
    const { data: existingData, error: checkError } = await supabase
      .from('resources_content')
      .select('id')
      .single();
    
    let updateError;
    
    if (checkError && checkError.code === 'PGRST116') {
      // No record exists, insert a new one
      const { error: insertError } = await supabase
        .from('resources_content')
        .insert([content]);
      
      updateError = insertError;
    } else {
      // Record exists, update it
      const { error: putError } = await supabase
        .from('resources_content')
        .update(content)
        .eq('id', existingData.id);
      
      updateError = putError;
    }
    
    if (updateError) {
      console.error("Error updating resources content:", updateError);
      return NextResponse.json({ error: "Failed to update resources content" }, { status: 500 });
    }
    
    // Log the update for audit purposes
    console.info(`Resources content updated by ${session.user.email}`);
    
    return NextResponse.json({
      message: "Resources content updated successfully"
    });
    
  } catch (error) {
    console.error("Unexpected error in resources content PUT endpoint:", error);
    return NextResponse.json({ 
      error: "An unexpected error occurred", 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}