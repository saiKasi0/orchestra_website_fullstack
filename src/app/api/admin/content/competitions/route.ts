import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { competitionsContentSchema as competitionsContentValidationSchema } from "@/types/competitions";
import { v4 as uuidv4 } from "uuid"; // Import uuid
import { uploadBase64Image, deleteStorageObject } from '@/utils/imageUtils'; // Import utilities

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
  const requestId = uuidv4().substring(0, 8); // Add request ID for logging
  console.log(`[${requestId}] Processing PUT request for competitions content`);

  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.warn(`[${requestId}] Unauthorized - No session`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Only allow admin and leadership roles
    if (!["admin", "leadership"].includes(session.user.role)) {
      console.warn(`[${requestId}] Forbidden - User ${session.user.email} role ${session.user.role}`);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const supabase = createClient();
    
    // Parse and validate request body using the imported validation schema
    let body;
    try {
      body = await req.json();
      console.log(`[${requestId}] Request body parsed`);
    } catch (parseError) {
      console.error(`[${requestId}] Error parsing request body:`, parseError);
      return NextResponse.json({ error: "Invalid JSON format" }, { status: 400 });
    }
    
    const validationResult = competitionsContentValidationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error(`[${requestId}] Validation Error:`, validationResult.error.format()); // Log formatted validation errors
      return NextResponse.json(
        { error: "Invalid data format", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const content = validationResult.data;
    console.log(`[${requestId}] Validation successful. Processing ${content.competitions.length} competitions.`);
    
    // Update page title and description
    console.log(`[${requestId}] Upserting page content`);
    const { error: pageError } = await supabase
      .from('competitions_page')
      .upsert({
        id: 1, // Assuming single record for page content
        title: content.title,
        description: content.description,
        updated_at: new Date().toISOString()
      });
      
    if (pageError) {
      console.error(`[${requestId}] Error updating competitions page data:`, pageError);
      return NextResponse.json({ error: "Failed to update page content" }, { status: 500 });
    }
    
    // --- Competition Processing ---
    const processedDbCompetitionIds: number[] = []; // Store only numeric DB IDs
    const imagesToDeleteFromStorage: string[] = []; // Store URLs of images to delete later

    // Fetch all existing competitions to compare images
    console.log(`[${requestId}] Fetching existing competition data for image comparison`);
    const { data: existingCompetitionsData, error: fetchExistingError } = await supabase
      .from('competitions')
      .select('id, image_url');

    if (fetchExistingError) {
       console.error(`[${requestId}] Error fetching existing competitions:`, fetchExistingError);
       // Decide if this is critical. For now, log and continue, image deletion might be incomplete.
    }
    const existingCompetitionsMap = new Map(
      existingCompetitionsData?.map(c => [c.id, c.image_url]) ?? []
    );
    
    console.log(`[${requestId}] Processing ${content.competitions.length} competitions...`);
    
    // Process competitions one by one
    for (let i = 0; i < content.competitions.length; i++) {
      const competition = content.competitions[i];
      let competitionDbId: number | null = typeof competition.id === 'number' && competition.id > 0 ? competition.id : null;
      let imageUrl = competition.image || null;
      const oldImageUrl = competitionDbId ? existingCompetitionsMap.get(competitionDbId) : null;

      console.log(`\n[${requestId}] Processing competition ${i + 1}: ID=${competitionDbId}, Name=${competition.name}`);

      // Process image if it's a base64 string
      if (imageUrl && imageUrl.startsWith('data:image')) {
        console.log(`[${requestId}]   Image is base64, attempting upload...`);
        // Use the utility function
        const uploadedUrl = await uploadBase64Image(
          supabase,
          'competition-images', // Bucket name
          imageUrl,
          'competition_images/', // Path prefix
          requestId
        );

        if (uploadedUrl) {
          imageUrl = uploadedUrl;
          console.log(`[${requestId}]   Image uploaded successfully. New URL: ${imageUrl}`);
          // If upload was successful and there was an old image different from the new one, mark old one for deletion
          if (oldImageUrl && oldImageUrl !== imageUrl && oldImageUrl.includes('/competition-images/')) {
            console.log(`[${requestId}]   Marking old image for deletion: ${oldImageUrl}`);
            imagesToDeleteFromStorage.push(oldImageUrl);
          }
        } else {
          console.error(`[${requestId}]   Failed to upload image for competition ${competition.name}.`);
          // Handle error - maybe skip image update or return error
          imageUrl = oldImageUrl; // Revert to old image URL on failure? Or set to null?
          // return NextResponse.json({ error: "Failed to process image upload" }, { status: 500 }); // Fail fast
        }
      } else {
        console.log(`[${requestId}]   Image is not base64 (or missing). Using: ${imageUrl}`);
        // If the image URL is removed (becomes null/empty) and there was an old one, mark old one for deletion
        if (oldImageUrl && !imageUrl && oldImageUrl.includes('/competition-images/')) {
           console.log(`[${requestId}]   Image removed. Marking old image for deletion: ${oldImageUrl}`);
           imagesToDeleteFromStorage.push(oldImageUrl);
        }
        // If the URL changed from one non-base64 URL to another, mark old one for deletion
        else if (oldImageUrl && imageUrl && oldImageUrl !== imageUrl && oldImageUrl.includes('/competition-images/')) {
           console.log(`[${requestId}]   Image URL changed. Marking old image for deletion: ${oldImageUrl}`);
           imagesToDeleteFromStorage.push(oldImageUrl);
        }
      }

      // Check if it's an existing competition based on numeric ID
      const isExistingCompetition = competitionDbId !== null;
      console.log(`[${requestId}]   Is existing competition (has DB ID)? ${isExistingCompetition}`);

      if (isExistingCompetition && competitionDbId !== null) {
        // Update existing competition
        console.log(`[${requestId}]   Attempting to UPDATE competition DB ID: ${competitionDbId}`);
        const { error: updateError } = await supabase
          .from('competitions')
          .update({
            name: competition.name,
            description: competition.description,
            image_url: imageUrl,
            additional_info: competition.additionalInfo || null,
            display_order: i,
            updated_at: new Date().toISOString()
          })
          .eq('id', competitionDbId);

        if (updateError) {
          console.error(`[${requestId}]   Error updating competition ${competitionDbId}:`, updateError);
          return NextResponse.json({ error: "Failed to update competition data", details: updateError }, { status: 500 });
        }
        console.log(`[${requestId}]   Successfully updated competition DB ID: ${competitionDbId}`);
        processedDbCompetitionIds.push(competitionDbId);

      } else {
        // Insert new competition
        console.log(`[${requestId}]   Attempting to INSERT new competition`);
         const { data: newComp, error: insertError } = await supabase
          .from('competitions')
          .insert({
            name: competition.name,
            description: competition.description,
            image_url: imageUrl,
            additional_info: competition.additionalInfo || null,
            display_order: i,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (insertError || !newComp) {
          console.error(`[${requestId}]   Error inserting new competition:`, insertError);
          return NextResponse.json({ error: "Failed to create new competition", details: insertError }, { status: 500 });
        }
        
        competitionDbId = newComp.id;
        console.log(`[${requestId}]   Successfully inserted new competition. New DB ID: ${competitionDbId}`);
        if (typeof competitionDbId === 'number') {
          processedDbCompetitionIds.push(competitionDbId);
        } else {
           console.error(`[${requestId}]   Error: Inserted competition ID is not a number:`, competitionDbId);
        }
      }
      
      // --- Category Processing ---
      if (typeof competitionDbId !== 'number') {
         console.error(`[${requestId}]   Cannot process categories, competition DB ID is missing or invalid.`);
         continue;
      }
      console.log(`[${requestId}]   Processing categories for competition DB ID: ${competitionDbId}`);
      
      // Delete existing categories for this competition
      console.log(`[${requestId}]     Deleting existing categories...`);
      const { error: deleteCatError } = await supabase
        .from('competition_categories')
        .delete()
        .eq('competition_id', competitionDbId);
        
      if (deleteCatError) {
        console.error(`[${requestId}]     Error deleting categories for competition ${competitionDbId}:`, deleteCatError);
        return NextResponse.json({ error: "Failed to update competition categories (delete step)", details: deleteCatError }, { status: 500 });
      }
      console.log(`[${requestId}]     Existing categories deleted (if any).`);
      
      // Insert new categories
      if (competition.categories && competition.categories.length > 0) {
        console.log(`[${requestId}]     Inserting ${competition.categories.length} new categories...`);
        const categoryEntries = competition.categories.map((category, index) => ({
          competition_id: competitionDbId,
          name: category,
          display_order: index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        console.log(`[${requestId}]     Category Entries:`, categoryEntries);
        
        const { error: insertCatError } = await supabase
          .from('competition_categories')
          .insert(categoryEntries);
          
        if (insertCatError) {
          console.error(`[${requestId}]     Error inserting categories for competition ${competitionDbId}:`, insertCatError);
          return NextResponse.json({ error: "Failed to save competition categories (insert step)", details: insertCatError }, { status: 500 });
        }
        console.log(`[${requestId}]     Successfully inserted categories.`);
      } else {
        console.log(`[${requestId}]     No categories to insert.`);
      }
      // --- End Category Processing ---
    }
    
    console.log(`\n[${requestId}] Finished processing all competitions.`);
    console.log(`[${requestId}] Final list of processed DB competition IDs:`, processedDbCompetitionIds);

    // Delete competitions that are no longer in the content
    console.log(`[${requestId}] Checking for competitions to delete...`);
    const dbIdsToDelete = Array.from(existingCompetitionsMap.keys())
        .filter((id): id is number => typeof id === 'number' && !processedDbCompetitionIds.includes(id));

    if (dbIdsToDelete.length > 0) {
      console.log(`[${requestId}]   Attempting to delete competitions with DB IDs: ${dbIdsToDelete.join(', ')}`);
      // Also mark their images for deletion
      dbIdsToDelete.forEach(idToDelete => {
        const imageUrlToDelete = existingCompetitionsMap.get(idToDelete);
        if (imageUrlToDelete && imageUrlToDelete.includes('/competition-images/')) {
          console.log(`[${requestId}]   Marking image for deletion (due to competition deletion): ${imageUrlToDelete}`);
          imagesToDeleteFromStorage.push(imageUrlToDelete);
        }
      });

      const { error: deleteError } = await supabase
        .from('competitions')
        .delete()
        .in('id', dbIdsToDelete);

      if (deleteError) {
        console.error(`[${requestId}]   Error deleting removed competitions:`, deleteError);
        // Log error but continue to attempt image deletion
      } else {
        console.log(`[${requestId}]   Successfully deleted ${dbIdsToDelete.length} removed competitions from DB.`);
      }
    } else {
      console.log(`[${requestId}]   No competitions found to delete from DB.`);
    }

    // Delete images marked for deletion from storage
    if (imagesToDeleteFromStorage.length > 0) {
       console.log(`\n[${requestId}] Deleting ${imagesToDeleteFromStorage.length} images from storage...`);
       let deletionSuccessCount = 0;
       const uniqueUrlsToDelete = [...new Set(imagesToDeleteFromStorage)]; // Ensure unique URLs
       for (const imageUrlToDelete of uniqueUrlsToDelete) {
         const success = await deleteStorageObject(supabase, 'competition-images', imageUrlToDelete, requestId);
         if (success) {
           deletionSuccessCount++;
         }
       }
       console.log(`[${requestId}] Finished storage deletion attempt. Successful/Skipped deletions: ${deletionSuccessCount}/${uniqueUrlsToDelete.length}`);
    } else {
       console.log(`\n[${requestId}] No images marked for deletion from storage.`);
    }
    
    console.log(`\n[${requestId}] PUT request completed successfully.`);
    return NextResponse.json({ 
      success: true, 
      message: "Competitions content updated successfully." 
    });
    
  } catch (error) {
    console.error(`[${requestId || 'UNKNOWN'}] Unexpected error in competitions PUT endpoint:`, error);
    return NextResponse.json({ error: "An unexpected error occurred", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
