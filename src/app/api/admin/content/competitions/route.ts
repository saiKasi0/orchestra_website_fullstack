import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { competitionsContentSchema as competitionsContentValidationSchema } from "@/types/competitions";
import { v4 as uuidv4 } from "uuid"; // Import uuid

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
    
    // Parse and validate request body using the imported validation schema
    const body = await req.json();
    const validationResult = competitionsContentValidationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error("Validation Error:", validationResult.error.errors); // Log validation errors
      return NextResponse.json(
        { error: "Invalid data format", details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const content = validationResult.data;
    console.log("Received content:", JSON.stringify(content, null, 2)); // Log received content
    
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
    
    // Handle competitions updates - track NUMERIC IDs to determine what to delete later
    const processedDbCompetitionIds: number[] = []; // Store only numeric DB IDs
    
    console.log(`Processing ${content.competitions.length} competitions...`); // Log start of processing
    
    // Process competitions one by one
    for (let i = 0; i < content.competitions.length; i++) {
      const competition = content.competitions[i];
      let competitionDbId: number | null = typeof competition.id === 'number' && competition.id > 0 ? competition.id : null; // Store the numeric DB ID if it exists
      let imageUrl = competition.image || null; // Use null if image is empty/undefined

      console.log(`\nProcessing competition ${i + 1}: ID=${competitionDbId}, Name=${competition.name}`); 

      // Process image if it's a base64 string
      if (imageUrl && imageUrl.startsWith('data:image')) {
        console.log(`  Image is base64, attempting upload...`);
        try {
          const base64Pattern = /^data:image\/(\w+);base64,(.+)$/;
          const matches = imageUrl.match(base64Pattern);
          
          if (!matches || matches.length !== 3) {
            throw new Error("Invalid image format");
          }
          
          const imageType = matches[1];
          const base64Data = matches[2];
          const binaryData = Buffer.from(base64Data, 'base64');
          
          const filename = `competition_${uuidv4()}.${imageType}`;
          const filePath = `competition_images/${filename}`; // Define storage path
          
          // Upload to Supabase storage
          const { error: uploadError } = await supabase
            .storage
            .from('competition-images') 
            .upload(filePath, binaryData, {
              contentType: `image/${imageType}`,
              upsert: true // Overwrite if file exists (optional)
            });
          
          if (uploadError) {
            console.error("Error uploading competition image:", uploadError);
            throw new Error("Failed to upload competition image"); 
          }
          
          // Get the public URL
          const { data: urlData } = supabase
            .storage
            .from('competition-images')
            .getPublicUrl(filePath);
          
          imageUrl = urlData.publicUrl; // Update imageUrl to the stored URL
          console.log(`  Image uploaded successfully. New URL: ${imageUrl}`);
        } catch (error) {
          console.error("  Error processing competition image upload:", error);
          return NextResponse.json({ error: "Failed to process image upload" }, { status: 500 });
        }
      } else {
        console.log(`  Image is not base64 (or missing). Using: ${imageUrl}`);
      }

      // Check if it's an existing competition based on numeric ID
      const isExistingCompetition = competitionDbId !== null;
      
      console.log(`  Is existing competition (has DB ID)? ${isExistingCompetition}`);

      if (isExistingCompetition && competitionDbId !== null) { // Ensure competitionDbId is not null here
        // Update existing competition
        console.log(`  Attempting to UPDATE competition DB ID: ${competitionDbId}`);
        const updateData = {
          name: competition.name,
          description: competition.description,
          image_url: imageUrl, 
          additional_info: competition.additionalInfo || null, // Use null if empty/undefined
          display_order: i,
          updated_at: new Date().toISOString()
        };
        console.log("  Update Data:", updateData);
        const { error: updateError } = await supabase
          .from('competitions')
          .update(updateData)
          .eq('id', competitionDbId); // Use the numeric DB ID
        
        if (updateError) {
          console.error(`  Error updating competition ${competitionDbId}:`, updateError);
          return NextResponse.json({ error: "Failed to update competition data", details: updateError }, { status: 500 });
        }
        console.log(`  Successfully updated competition DB ID: ${competitionDbId}`);
        processedDbCompetitionIds.push(competitionDbId); // Add the numeric DB ID

      } else {
        // Insert new competition (ID is generated by DB)
        console.log(`  Attempting to INSERT new competition`);
        const insertData = {
          name: competition.name,
          description: competition.description,
          image_url: imageUrl,
          additional_info: competition.additionalInfo || null, // Use null if empty/undefined
          display_order: i,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        console.log("  Insert Data:", insertData);
        const { data: newComp, error: insertError } = await supabase
          .from('competitions')
          .insert(insertData)
          .select('id') // Select the generated ID
          .single();
          
        if (insertError || !newComp) {
          console.error("  Error inserting new competition:", insertError);
          return NextResponse.json({ error: "Failed to create new competition", details: insertError }, { status: 500 });
        }
        
        competitionDbId = newComp.id; // Get the newly generated numeric DB ID
        console.log(`  Successfully inserted new competition. New DB ID: ${competitionDbId}`);
        // Ensure competitionDbId is a number before pushing
        if (typeof competitionDbId === 'number') { 
          processedDbCompetitionIds.push(competitionDbId); // Add the new numeric DB ID
        } else {
           console.error("  Error: Inserted competition ID is not a number:", competitionDbId);
           // Handle this unlikely scenario if necessary
        }
      }
      
      // --- Category Processing ---
      // Check if competitionDbId is a valid number before processing categories
      if (typeof competitionDbId !== 'number') { 
         console.error("  Cannot process categories, competition DB ID is missing or invalid.");
         continue; // Skip category processing for this item
      }
      console.log(`  Processing categories for competition DB ID: ${competitionDbId}`); 
      
      // Delete existing categories for this competition
      console.log(`    Deleting existing categories...`);
      const { error: deleteCatError } = await supabase
        .from('competition_categories')
        .delete()
        .eq('competition_id', competitionDbId); // Use numeric DB ID (now guaranteed to be number)
        
      if (deleteCatError) {
        console.error(`    Error deleting categories for competition ${competitionDbId}:`, deleteCatError);
        return NextResponse.json({ error: "Failed to update competition categories (delete step)", details: deleteCatError }, { status: 500 });
      }
      console.log(`    Existing categories deleted (if any).`);
      
      // Insert new categories
      if (competition.categories && competition.categories.length > 0) {
        console.log(`    Inserting ${competition.categories.length} new categories...`);
        const categoryEntries = competition.categories.map((category, index) => ({
          competition_id: competitionDbId, // Use numeric DB ID (now guaranteed to be number)
          name: category,
          display_order: index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        console.log("    Category Entries:", categoryEntries);
        
        const { error: insertCatError } = await supabase
          .from('competition_categories')
          .insert(categoryEntries);
          
        if (insertCatError) {
          console.error(`    Error inserting categories for competition ${competitionDbId}:`, insertCatError);
          return NextResponse.json({ error: "Failed to save competition categories (insert step)", details: insertCatError }, { status: 500 });
        }
        console.log(`    Successfully inserted categories.`);
      } else {
        console.log(`    No categories to insert.`);
      }
      // --- End Category Processing ---
    }
    
    console.log("\nFinished processing all competitions.");
    console.log("Final list of processed DB competition IDs:", processedDbCompetitionIds);

    // Delete competitions that are no longer in the content (use numeric IDs)
    console.log("Checking for competitions to delete...");
    const { data: allDbCompetitions, error: fetchAllError } = await supabase
      .from('competitions')
      .select('id');

    if (fetchAllError) {
      console.error("Error fetching all competition IDs for deletion check:", fetchAllError);
    } else if (allDbCompetitions) {
      const dbIdsToDelete = allDbCompetitions
        .map(comp => comp.id)
        // Ensure only numbers are compared and included
        .filter((id): id is number => typeof id === 'number' && !processedDbCompetitionIds.includes(id)); 

      if (dbIdsToDelete.length > 0) {
        console.log(`  Attempting to delete competitions with DB IDs: ${dbIdsToDelete.join(', ')}`);
        const { error: deleteError } = await supabase
          .from('competitions')
          .delete()
          .in('id', dbIdsToDelete); // Delete by numeric ID list

        if (deleteError) {
          console.error("  Error deleting removed competitions:", deleteError);
        } else {
          console.log(`  Successfully deleted ${dbIdsToDelete.length} removed competitions.`);
        }
      } else {
        console.log("  No competitions found to delete.");
      }
    } else {
       console.log("  Could not fetch existing DB IDs to check for deletions.");
    }
    
    console.log("\nPUT request completed successfully.");
    return NextResponse.json({ 
      success: true, 
      message: "Competitions content updated successfully." 
    });
    
  } catch (error) {
    console.error("Unexpected error in competitions PUT endpoint:", error);
    return NextResponse.json({ error: "An unexpected error occurred", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
