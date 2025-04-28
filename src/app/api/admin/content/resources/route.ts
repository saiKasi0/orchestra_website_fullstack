import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { resourcesContentSchema } from "@/types/resources";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

const RESOURCE_ID = 1; // Define the constant ID

// Default content structure
const defaultContent = {
  calendar_url: "https://calendar.google.com/calendar/embed?src=c_20p6293m4hda8ecdv1k63ki418%40group.calendar.google.com&amp",
  support_title: "Just For Some Support :)",
  youtube_url: "https://www.youtube.com/embed/QkklAQLhnQY?si=HGTk2aKkxV3r1ITb"
};

// GET endpoint for resources content
export async function GET() {
  try {
    const supabase = createClient();
    
    // Query resources content specifically for id = 1
    const { data, error } = await supabase
      .from('resources_content')
      .select('*')
      .eq('id', RESOURCE_ID) // Fetch only the record with id = 1
      .single();
      
    if (error) {
      console.error("Error fetching resources content (id=1):", error.message);
      
      // If no record exists (PGRST116), return default values
      if (error.code === 'PGRST116') {
        console.log("No resources record found (id=1), returning defaults.");
        return NextResponse.json({ 
          content: defaultContent 
        });
      }
      
      // For other errors
      return NextResponse.json({ error: "Failed to fetch resources content" }, { status: 500 });
    }
    
    // Return the found content (which should have id=1)
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
    
    const allowedRoles = ["admin", "leadership"];
    if (!session.user?.role || !allowedRoles.includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized - Insufficient permissions" }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = resourcesContentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: result.error.format() 
      }, { status: 400 });
    }
    
    // Data to be saved (without the id)
    const contentToSave = result.data;
    
    // Create Supabase client
    const supabase = createClient();
    
    // 1. Attempt to UPDATE the record with id = 1
    const { error: updateError, count: updateCount } = await supabase
      .from('resources_content')
      .update(contentToSave)
      .eq('id', RESOURCE_ID);

    if (updateError) {
      console.error("Error attempting to update resources content (id=1):", updateError);
      // Don't immediately fail, maybe the record just doesn't exist yet.
      // We'll check updateCount next. If it's a different error, the insert might also fail.
    }

    // 2. If update didn't affect any rows (likely because it doesn't exist), attempt to INSERT
    if (updateCount === 0 && (!updateError)) {
      console.log(`No record found with id=${RESOURCE_ID} to update. Attempting insert.`);
      
      // Insert the content, letting the DB generate the ID.
      // We assume the first insert will get ID=1 due to GENERATED ALWAYS sequence.
      const { error: insertError } = await supabase
        .from('resources_content')
        .insert(contentToSave); // Do NOT specify ID here

      if (insertError) {
        console.error("Error inserting resources content after failed update:", insertError);
        // If insert fails after update failed, return error
        return NextResponse.json({ error: "Failed to save resources content (insert failed)" }, { status: 500 });
      }
      console.log("Successfully inserted new resources content record.");
    } else if (updateError) {
      // If there was an update error AND updateCount was not 0, it's a real update error
       return NextResponse.json({ error: "Failed to update resources content" }, { status: 500 });
    } else {
       console.log(`Successfully updated resources content record (id=${RESOURCE_ID}).`);
    }

    // Log the action
    console.info(`Resources content (id=${RESOURCE_ID}) saved by ${session.user.email}`);
    
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