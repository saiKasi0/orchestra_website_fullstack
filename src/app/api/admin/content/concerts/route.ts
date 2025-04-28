import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { concertsContentSchema } from "@/types/concerts";
import { v4 as uuidv4 } from "uuid";
import { uploadBase64Image, deleteStorageObject } from '@/utils/imageUtils';

// GET endpoint for concerts content
export async function GET() {
  try {
    const supabase = createClient();

    const { data: concertData, error: concertError } = await supabase
      .from('concert_page_content')
      .select('*')
      .single();

    if (concertError) {
      console.error("Error fetching concert data:", concertError);

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

    const { data: orchestraGroups, error: orchestraError } = await supabase
      .from('orchestra_groups')
      .select('*')
      .order('order_number', { ascending: true });

    if (orchestraError) {
      console.error("Error fetching orchestra groups:", orchestraError);
      return NextResponse.json({ error: "Failed to fetch orchestra groups" }, { status: 500 });
    }

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
  const requestId = uuidv4().substring(0, 8);
  console.log(`[${requestId}] Processing PUT request for concerts content`);

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.warn(`[${requestId}] Unauthorized - No session`);
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }

    if (!["admin", "leadership"].includes(session.user?.role as string)) {
      console.warn(`[${requestId}] Forbidden - User ${session.user.email} role ${session.user.role}`);
      return NextResponse.json({ error: "Unauthorized - Insufficient permissions" }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
      console.log(`[${requestId}] Request body parsed`);
    } catch (parseError) {
      console.error(`[${requestId}] Error parsing request body:`, parseError);
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }

    const result = concertsContentSchema.safeParse(body);

    if (!result.success) {
      console.error(`[${requestId}] Validation error:`, result.error.format());
      return NextResponse.json({
        error: "Validation error",
        details: result.error.format()
      }, { status: 400 });
    }

    const content = result.data;
    const supabase = createClient();
    let oldPosterImageUrl: string | null = null;

    console.log(`[${requestId}] Fetching current concert data for image comparison`);
    const { data: currentData, error: fetchCurrentError } = await supabase
      .from('concert_page_content')
      .select('poster_image_url')
      .eq('id', 1)
      .maybeSingle();

    if (fetchCurrentError && fetchCurrentError.code !== 'PGRST116') {
      console.error(`[${requestId}] Error fetching current concert data:`, fetchCurrentError);
    } else if (currentData) {
      oldPosterImageUrl = currentData.poster_image_url;
      console.log(`[${requestId}] Found old poster image URL: ${oldPosterImageUrl}`);
    }

    let newPosterImageUrl = content.poster_image_url;
    let imageToDelete: string | null = null;

    if (content.poster_image_url && content.poster_image_url.startsWith('data:image')) {
      console.log(`[${requestId}] Poster image is base64, attempting upload...`);
      try {
        const uploadedUrl = await uploadBase64Image(
          supabase,
          'concert-images',
          content.poster_image_url,
          'concert_images/',
          requestId
        );

        if (uploadedUrl) {
          newPosterImageUrl = uploadedUrl;
          console.log(`[${requestId}] Image uploaded successfully. New URL: ${newPosterImageUrl}`);
          if (oldPosterImageUrl && oldPosterImageUrl !== newPosterImageUrl && oldPosterImageUrl.includes('/concert-images/')) {
            console.log(`[${requestId}] Marking old image for deletion: ${oldPosterImageUrl}`);
            imageToDelete = oldPosterImageUrl;
          }
        } else {
          console.error(`[${requestId}] Failed to upload poster image.`);
          newPosterImageUrl = oldPosterImageUrl;
        }
      } catch (error) {
        console.error(`[${requestId}] Error processing poster image upload:`, error);
        return NextResponse.json({ error: "Failed to process image upload" }, { status: 500 });
      }
    } else {
      console.log(`[${requestId}] Poster image is not base64 (or missing). Using: ${newPosterImageUrl}`);
      if (oldPosterImageUrl && oldPosterImageUrl !== newPosterImageUrl && oldPosterImageUrl.includes('/concert-images/')) {
        if (!newPosterImageUrl) {
          console.log(`[${requestId}] Poster image removed. Marking old image for deletion: ${oldPosterImageUrl}`);
        } else {
          console.log(`[${requestId}] Poster image URL changed. Marking old image for deletion: ${oldPosterImageUrl}`);
        }
        imageToDelete = oldPosterImageUrl;
      }
    }

    if (imageToDelete) {
      console.log(`[${requestId}] Attempting deletion of old image: ${imageToDelete}`);
      await deleteStorageObject(supabase, 'concert-images', imageToDelete, requestId);
    }

    console.log(`[${requestId}] Upserting concert page content (ID: 1)`);
    const { error: upsertError } = await supabase
      .from('concert_page_content')
      .upsert({
        id: 1,
        concert_name: content.concert_name,
        poster_image_url: newPosterImageUrl,
        no_concert_text: content.no_concert_text,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (upsertError) {
      console.error(`[${requestId}] Error upserting concert data:`, upsertError);
      return NextResponse.json({
        error: "Failed to update concert data",
        message: upsertError.message
      }, { status: 500 });
    }
    console.log(`[${requestId}] Concert page content upserted successfully.`);

    console.log(`[${requestId}] Processing orchestra groups and songs...`);
    const { data: existingGroups, error: getGroupsError } = await supabase
      .from('orchestra_groups')
      .select('group_id');

    if (getGroupsError) {
      console.error(`[${requestId}] Error getting existing orchestra groups:`, getGroupsError);
      return NextResponse.json({ error: "Failed to update orchestra groups" }, { status: 500 });
    }

    const newGroupIds = content.orchestras.map(orchestra => orchestra.id);
    const existingGroupIds = existingGroups ? existingGroups.map(g => g.group_id) : [];
    const groupIdsToDelete = existingGroupIds.filter(id => !newGroupIds.includes(id));

    if (groupIdsToDelete.length > 0) {
      console.log(`[${requestId}] Deleting orchestra groups: ${groupIdsToDelete.join(', ')}`);
      const { error: deleteGroupsError } = await supabase
        .from('orchestra_groups')
        .delete()
        .in('group_id', groupIdsToDelete);

      if (deleteGroupsError) {
        console.error(`[${requestId}] Error deleting orchestra groups:`, deleteGroupsError);
        return NextResponse.json({ error: "Failed to update orchestra groups (delete step)" }, { status: 500 });
      }
    }

    for (let i = 0; i < content.orchestras.length; i++) {
      const orchestra = content.orchestras[i];
      console.log(`[${requestId}] Processing group: ${orchestra.name} (ID: ${orchestra.id})`);

      const { error: upsertGroupError } = await supabase
        .from('orchestra_groups')
        .upsert({
          group_id: orchestra.id,
          name: orchestra.name,
          order_number: i,
          updated_at: new Date().toISOString()
        }, { onConflict: 'group_id' });

      if (upsertGroupError) {
        console.error(`[${requestId}] Error upserting orchestra group ${orchestra.id}:`, upsertGroupError);
        return NextResponse.json({
          error: "Failed to update orchestra groups (upsert step)",
          message: upsertGroupError.message
        }, { status: 500 });
      }

      console.log(`[${requestId}]   Deleting existing songs for group ${orchestra.id}`);
      const { error: deleteSongsError } = await supabase
        .from('songs')
        .delete()
        .eq('group_id', orchestra.id);

      if (deleteSongsError) {
        console.error(`[${requestId}]   Error deleting songs for group ${orchestra.id}:`, deleteSongsError);
        return NextResponse.json({ error: "Failed to update songs (delete step)" }, { status: 500 });
      }

      if (orchestra.songs.length > 0) {
        console.log(`[${requestId}]   Inserting ${orchestra.songs.length} songs for group ${orchestra.id}`);
        const songsToInsert = orchestra.songs.map((song, songIndex) => ({
          group_id: orchestra.id,
          song_title: song || "Untitled",
          order_number: songIndex
        }));

        const { error: insertSongsError } = await supabase
          .from('songs')
          .insert(songsToInsert);

        if (insertSongsError) {
          console.error(`[${requestId}]   Error inserting songs for group ${orchestra.id}:`, insertSongsError);
          return NextResponse.json({
            error: "Failed to update songs (insert step)",
            details: insertSongsError.message
          }, { status: 500 });
        }
      } else {
        console.log(`[${requestId}]   No songs to insert for group ${orchestra.id}`);
      }
    }

    console.info(`[${requestId}] Concerts content updated by ${session.user.email}`);

    return NextResponse.json({
      message: "Concerts content updated successfully",
    });

  } catch (error) {
    console.error(`[${requestId || 'UNKNOWN'}] Unexpected error in concerts content PUT endpoint:`, error);
    return NextResponse.json({
      error: "An unexpected error occurred",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
