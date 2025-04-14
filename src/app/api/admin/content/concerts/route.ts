import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { concertsContentSchema } from "@/types/concerts";
import { v4 as uuidv4 } from "uuid";

// GET endpoint for concerts content
export async function GET() {
  try {
    const supabase = createClient();
    
    // Query concert content
    const { data: concertData, error: concertError } = await supabase
      .from('concert_page_content')
      .select('*')
      .single();
      
    if (concertError) {
      console.error("Error fetching concert data:", concertError);
      
      // If no record exists yet, return default values
      if (concertError.code === 'PGRST116') {
        return NextResponse.json({ 
          content: {
            concert_name: "",
            poster_image_url: "",
            no_concert_text: "No concert order is available at this time. Please check back later.",
            orchestras: []
          }
        });
      }
      
      return NextResponse.json({ error: "Failed to fetch concert data" }, { status: 500 });
    }
    
    // Fetch orchestra groups
    const { data: orchestraGroups, error: orchestraError } = await supabase
      .from('orchestra_groups')
      .select('*')
      .order('order_number', { ascending: true });
      
    if (orchestraError) {
      console.error("Error fetching orchestra groups:", orchestraError);
      return NextResponse.json({ error: "Failed to fetch orchestra groups" }, { status: 500 });
    }
    
    // Fetch songs for each orchestra group
    const orchestrasWithSongs = await Promise.all(
      orchestraGroups.map(async (orchestra) => {
        const { data: songs, error: songsError } = await supabase
          .from('songs')  
          .select('song_title')
          .eq('group_id', orchestra.group_id)
          .order('order_number', { ascending: true });
          
        if (songsError) {
          console.error(`Error fetching songs for group ${orchestra.group_id}:`, songsError);
          return { 
            id: orchestra.group_id, 
            name: orchestra.name, 
            songs: [] 
          };
        }
        
        return {
          id: orchestra.group_id,
          name: orchestra.name,
          songs: songs.map(song => song.song_title)
        };
      })
    );
    
    // Format the complete content
    const content = {
      id: concertData.id,
      concert_name: concertData.concert_name,
      poster_image_url: concertData.poster_image_url || '',
      no_concert_text: concertData.no_concert_text || 'No concert order is available at this time. Please check back later.',
      orchestras: orchestrasWithSongs
    };
    
    return NextResponse.json({ content });
    
  } catch (error) {
    console.error("Unexpected error in concerts content GET endpoint:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// PUT endpoint for concerts content
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
    
    // Perform validation with improved error handling
    const result = concertsContentSchema.safeParse(body);
    if (!result.success) {
      console.error("Validation error:", result.error.format());
      return NextResponse.json({ 
        error: "Validation error", 
        details: result.error.format() 
      }, { status: 400 });
    }
    
    const content = result.data;
    const supabase = createClient();
    
    // Process poster image if it's a base64 string
    if (content.poster_image_url && content.poster_image_url.startsWith('data:image')) {
      try {
        // Extract base64 data and file type
        const base64Pattern = /^data:image\/(\w+);base64,(.+)$/;
        const matches = content.poster_image_url.match(base64Pattern);
        
        if (!matches || matches.length !== 3) {
          throw new Error("Invalid image format");
        }
        
        const imageType = matches[1];
        const base64Data = matches[2];
        const binaryData = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const filename = `concert_poster_${uuidv4()}.${imageType}`;
        const filePath = `concert_images/${filename}`;
        
        // Upload to Supabase storage
        const { error: uploadError } = await supabase
          .storage
          .from('concert-images')
          .upload(filePath, binaryData, {
            contentType: `image/${imageType}`,
            upsert: true
          });
        
        if (uploadError) {
          console.error("Error uploading poster image:", uploadError);
          throw new Error("Failed to upload poster image");
        }
        
        // Get the public URL
        const { data: urlData } = supabase
          .storage
          .from('concert-images')
          .getPublicUrl(filePath);
        
        content.poster_image_url = urlData.publicUrl;
        
      } catch (error) {
        console.error("Error processing poster image upload:", error);
        return NextResponse.json({ error: "Failed to process image upload" }, { status: 500 });
      }
    }
    
    // Check if the record exists first
    const { data: existingRecord, error: checkError } = await supabase
      .from('concert_page_content')
      .select('id')
      .eq('id', 1)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking for existing concert record:", checkError);
      return NextResponse.json({ error: "Failed to check existing concert data" }, { status: 500 });
    }
    
    // Update or insert based on whether the record exists
    if (existingRecord) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('concert_page_content')
        .update({
          concert_name: content.concert_name,
          poster_image_url: content.poster_image_url,
          no_concert_text: content.no_concert_text,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);
        
      if (updateError) {
        console.error("Error updating concert data:", updateError);
        return NextResponse.json({ 
          error: "Failed to update concert data", 
          message: updateError.message 
        }, { status: 500 });
      }
    } else {
      // Insert new record - don't specify ID to let DB auto-generate it
      const { error: insertError } = await supabase
        .from('concert_page_content')
        .insert({
          concert_name: content.concert_name,
          poster_image_url: content.poster_image_url,
          no_concert_text: content.no_concert_text
          // Don't need to specify id, created_at, or updated_at - DB will handle these
        });
        
      if (insertError) {
        console.error("Error creating concert record:", insertError);
        return NextResponse.json({ 
          error: "Failed to create concert record", 
          message: insertError.message 
        }, { status: 500 });
      }
    }
    
    // Handle orchestra groups - get existing groups
    const { data: existingGroups, error: getGroupsError } = await supabase
      .from('orchestra_groups')
      .select('group_id');
      
    if (getGroupsError) {
      console.error("Error getting existing orchestra groups:", getGroupsError);
      return NextResponse.json({ error: "Failed to update orchestra groups" }, { status: 500 });
    }
    
    // Determine which groups to keep vs. delete
    const newGroupIds = content.orchestras.map(orchestra => orchestra.id);
    const groupIdsToDelete = existingGroups
      ? existingGroups
          .filter(group => !newGroupIds.includes(group.group_id))
          .map(group => group.group_id)
      : [];
      
    // Delete removed orchestra groups
    if (groupIdsToDelete.length > 0) {
      const { error: deleteGroupsError } = await supabase
        .from('orchestra_groups')
        .delete()
        .in('group_id', groupIdsToDelete);
        
      if (deleteGroupsError) {
        console.error("Error deleting orchestra groups:", deleteGroupsError);
        return NextResponse.json({ error: "Failed to update orchestra groups" }, { status: 500 });
      }
    }
    
    // Update or insert orchestra groups and their songs
    for (let i = 0; i < content.orchestras.length; i++) {
      const orchestra = content.orchestras[i];
      
      // Upsert the orchestra group
      const { error: upsertGroupError } = await supabase
        .from('orchestra_groups')
        .upsert({
          group_id: orchestra.id,
          name: orchestra.name,
          order_number: i,
          updated_at: new Date().toISOString()
        }, { onConflict: 'group_id' });
        
      if (upsertGroupError) {
        console.error(`Error upserting orchestra group ${orchestra.id}:`, upsertGroupError);
        return NextResponse.json({ 
          error: "Failed to update orchestra groups",
          message: upsertGroupError.message
        }, { status: 500 });
      }
      
      // Delete existing songs for this group
      const { error: deleteSongsError } = await supabase
        .from('songs')
        .delete()
        .eq('group_id', orchestra.id);
        
      if (deleteSongsError) {
        console.error(`Error deleting songs for group ${orchestra.id}:`, deleteSongsError);
        return NextResponse.json({ error: "Failed to update songs" }, { status: 500 });
      }
      
      // Insert new songs
      if (orchestra.songs.length > 0) {
        const songsToInsert = orchestra.songs.map((song, songIndex) => ({
          group_id: orchestra.id,
          song_title: song || "Untitled",
          order_number: songIndex
        }));
        
        const { error: insertSongsError } = await supabase
          .from('songs')
          .insert(songsToInsert);
          
        if (insertSongsError) {
          console.error(`Error inserting songs for group ${orchestra.id}:`, insertSongsError);
          return NextResponse.json({ 
            error: "Failed to update songs", 
            details: insertSongsError.message 
          }, { status: 500 });
        }
      }
    }
    
    // Log the update for audit purposes
    console.info(`Concerts content updated by ${session.user.email}`);
    
    return NextResponse.json({
      message: "Concerts content updated successfully",
    });
    
  } catch (error) {
    console.error("Unexpected error in concerts content PUT endpoint:", error);
    return NextResponse.json({ 
      error: "An unexpected error occurred", 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}
