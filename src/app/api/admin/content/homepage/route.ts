import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { homepageContentSchema } from "@/types/homepage";
import { v4 as uuidv4 } from "uuid";

// Get homepage content
export async function GET() {
  try {
    const supabase = createClient();
    
    // For public access, we don't need session checks since our RLS policies allow public read
    // Query homepage content
    const { data: basicContent, error: basicError } = await supabase
      .from('homepage_content')
      .select('*')
      .single();
      
    if (basicError) {
      console.error("Error fetching homepage content:", basicError);
      return NextResponse.json({ error: "Failed to fetch homepage content" }, { status: 500 });
    }
    
    // Fetch event cards
    const { data: eventCards, error: eventCardsError } = await supabase
      .from('homepage_event_cards')
      .select('*')
      .order('order_number', { ascending: true });
      
    if (eventCardsError) {
      console.error("Error fetching event cards:", eventCardsError);
      return NextResponse.json({ error: "Failed to fetch event cards" }, { status: 500 });
    }
    
    // Fetch staff members
    const { data: staffMembers, error: staffMembersError } = await supabase
      .from('staff_members')
      .select('*')
      .order('order_number', { ascending: true });
      
    if (staffMembersError) {
      console.error("Error fetching staff members:", staffMembersError);
      return NextResponse.json({ error: "Failed to fetch staff members" }, { status: 500 });
    }
    
    // Fetch leadership sections
    const { data: leadershipSections, error: leadershipSectionsError } = await supabase
      .from('leadership_sections')
      .select('*')
      .order('order_number', { ascending: true });
      
    if (leadershipSectionsError) {
      console.error("Error fetching leadership sections:", leadershipSectionsError);
      return NextResponse.json({ error: "Failed to fetch leadership sections" }, { status: 500 });
    }
    
    // Fetch leadership members for each section
    const leadershipWithMembers = await Promise.all(
      leadershipSections.map(async (section) => {
        const { data: members, error: membersError } = await supabase
          .from('leadership_members')
          .select('*')
          .eq('section_id', section.section_id)
          .order('order_number', { ascending: true });
          
        if (membersError) {
          console.error(`Error fetching members for section ${section.section_id}:`, membersError);
          return { ...section, members: [] };
        }
        
        return {
          id: section.section_id,
          name: section.name,
          color: section.color || '#3b82f6', // Include color with default fallback
          members: members.map(member => ({
            id: member.member_id,
            name: member.name,
            image_url: member.image_url || '',
          }))
        };
      })
    );
    
    // Format event cards to match the expected schema
    const formattedEventCards = eventCards.map(card => ({
      id: card.card_id,
      title: card.title,
      description: card.description || '',
      link_text: card.link_text || '',
      link_url: card.link_url || '',
    }));
    
    // Format staff members to match the expected schema
    const formattedStaffMembers = staffMembers.map(member => ({
      id: member.member_id,
      name: member.name,
      position: member.position || '',
      image_url: member.image_url || '',
      bio: member.bio || '',
    }));
    
    // Combine all the data
    const fullContent = {
      ...basicContent,
      event_cards: formattedEventCards,
      staff_members: formattedStaffMembers,
      leadership_sections: leadershipWithMembers,
    };
    
    return NextResponse.json({ content: fullContent });
    
  } catch (error) {
    console.error("Unexpected error in homepage content GET endpoint:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// Update homepage content
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
    const result = homepageContentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: result.error.format() 
      }, { status: 400 });
    }
    
    const content = result.data;
    
    // Create Supabase client
    const supabase = createClient();
    
    // Handle hero image upload if it's a base64 string
    if (content.hero_image_url && content.hero_image_url.startsWith('data:image')) {
      try {
        // Extract base64 data and file type
        const base64Pattern = /^data:image\/(\w+);base64,(.+)$/;
        const matches = content.hero_image_url.match(base64Pattern);
        
        if (!matches || matches.length !== 3) {
          throw new Error("Invalid image format");
        }
        
        const imageType = matches[1];
        const base64Data = matches[2];
        
        // Convert base64 to binary
        const binaryData = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const filename = `hero_image_${uuidv4()}.${imageType}`;
        const filePath = `hero_images/${filename}`;
        
        // Upload to Supabase storage
        const { error: uploadError } = await supabase
          .storage
          .from('homepage-images')
          .upload(filePath, binaryData, {
            contentType: `image/${imageType}`,
            upsert: true
          });
        
        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw new Error("Failed to upload image");
        }
        
        // Get the public URL
        const { data: urlData } = supabase
          .storage
          .from('homepage-images')
          .getPublicUrl(filePath);
        
        // Update the image URL to the stored version
        content.hero_image_url = urlData.publicUrl;
        
      } catch (error) {
        console.error("Error processing image upload:", error);
        return NextResponse.json({ error: "Failed to process image upload" }, { status: 500 });
      }
    }
    
    // Process staff member images
    if (content.staff_members && content.staff_members.length > 0) {
      for (let i = 0; i < content.staff_members.length; i++) {
        const member = content.staff_members[i];
        
        if (member.image_url && member.image_url.startsWith('data:image')) {
          try {
            // Extract base64 data and file type
            const base64Pattern = /^data:image\/(\w+);base64,(.+)$/;
            const matches = member.image_url.match(base64Pattern);
            
            if (!matches || matches.length !== 3) {
              continue; // Skip invalid images
            }
            
            const imageType = matches[1];
            const base64Data = matches[2];
            
            // Convert base64 to binary
            const binaryData = Buffer.from(base64Data, 'base64');
            
            // Generate unique filename
            const filename = `staff_${member.id}_${uuidv4()}.${imageType}`;
            const filePath = `staff_images/${filename}`;
            
            // Upload to Supabase storage
            const { error: uploadError } = await supabase
              .storage
              .from('homepage-images')
              .upload(filePath, binaryData, {
                contentType: `image/${imageType}`,
                upsert: true
              });
            
            if (uploadError) {
              console.error(`Error uploading staff image for ${member.name}:`, uploadError);
              continue; // Skip to next member if upload fails
            }
            
            // Get the public URL
            const { data: urlData } = supabase
              .storage
              .from('homepage-images')
              .getPublicUrl(filePath);
            
            // Update the image URL to the stored version
            content.staff_members[i].image_url = urlData.publicUrl;
            
          } catch (error) {
            console.error(`Error processing staff image for ${member.name}:`, error);
            // Continue with other uploads even if one fails
          }
        }
      }
    }
    
    // Process leadership member images
    if (content.leadership_sections && content.leadership_sections.length > 0) {
      for (const section of content.leadership_sections) {
        if (section.members && section.members.length > 0) {
          for (let i = 0; i < section.members.length; i++) {
            const member = section.members[i];
            
            if (member.image_url && member.image_url.startsWith('data:image')) {
              try {
                // Extract base64 data and file type
                const base64Pattern = /^data:image\/(\w+);base64,(.+)$/;
                const matches = member.image_url.match(base64Pattern);
                
                if (!matches || matches.length !== 3) {
                  continue; // Skip invalid images
                }
                
                const imageType = matches[1];
                const base64Data = matches[2];
                
                // Convert base64 to binary
                const binaryData = Buffer.from(base64Data, 'base64');
                
                // Generate unique filename
                const filename = `leadership_${section.id}_${member.id}_${uuidv4()}.${imageType}`;
                const filePath = `leadership_images/${filename}`;
                
                // Upload to Supabase storage
                const { error: uploadError } = await supabase
                  .storage
                  .from('homepage-images')
                  .upload(filePath, binaryData, {
                    contentType: `image/${imageType}`,
                    upsert: true
                  });
                
                if (uploadError) {
                  console.error(`Error uploading leadership image for ${member.name}:`, uploadError);
                  continue; // Skip to next member if upload fails
                }
                
                // Get the public URL
                const { data: urlData } = supabase
                  .storage
                  .from('homepage-images')
                  .getPublicUrl(filePath);
                
                // Update the image URL to the stored version
                member.image_url = urlData.publicUrl;
                
              } catch (error) {
                console.error(`Error processing leadership image for ${member.name}:`, error);
                // Continue with other uploads even if one fails
              }
            }
          }
        }
      }
    }
    
    // Update basic content in homepage_content table
    const { error: updateError } = await supabase
      .from('homepage_content')
      .update({
        hero_image_url: content.hero_image_url,
        hero_title: content.hero_title,
        hero_subtitle: content.hero_subtitle,
        about_title: content.about_title,
        about_description: content.about_description,
        featured_events_title: content.featured_events_title,
        stats_students: content.stats_students,
        stats_performances: content.stats_performances,
        stats_years: content.stats_years,
        staff_leadership_title: content.staff_leadership_title,
      })
      .eq('id', 1); // Assuming there's only one homepage content record
    
    if (updateError) {
      console.error("Error updating homepage content:", updateError);
      return NextResponse.json({ error: "Failed to update homepage content" }, { status: 500 });
    }
    
    // Update event cards
    // First, delete all existing event cards
    const { error: deleteCardsError } = await supabase
      .from('homepage_event_cards')
      .delete()
      .neq('id', 0); // Delete all records
      
    if (deleteCardsError) {
      console.error("Error deleting event cards:", deleteCardsError);
      return NextResponse.json({ error: "Failed to update event cards" }, { status: 500 });
    }
    
    // Then, insert new event cards
    const eventCardsToInsert = content.event_cards.map((card, index) => ({
      card_id: card.id,
      title: card.title,
      description: card.description,
      link_text: card.link_text,
      link_url: card.link_url,
      order_number: index
    }));
    
    if (eventCardsToInsert.length > 0) {
      const { error: insertCardsError } = await supabase
        .from('homepage_event_cards')
        .insert(eventCardsToInsert);
        
      if (insertCardsError) {
        console.error("Error inserting event cards:", insertCardsError);
        return NextResponse.json({ error: "Failed to update event cards" }, { status: 500 });
      }
    }
    
    // Update staff members
    // First, delete all existing staff members
    const { error: deleteStaffError } = await supabase
      .from('staff_members')
      .delete()
      .neq('id', 0); // Delete all records
      
    if (deleteStaffError) {
      console.error("Error deleting staff members:", deleteStaffError);
      return NextResponse.json({ error: "Failed to update staff members" }, { status: 500 });
    }
    
    // Then, insert new staff members
    const staffMembersToInsert = content.staff_members.map((member, index) => ({
      member_id: member.id,
      name: member.name,
      position: member.position,
      image_url: member.image_url,
      bio: member.bio,
      order_number: index
    }));
    
    if (staffMembersToInsert.length > 0) {
      const { error: insertStaffError } = await supabase
        .from('staff_members')
        .insert(staffMembersToInsert);
        
      if (insertStaffError) {
        console.error("Error inserting staff members:", insertStaffError);
        return NextResponse.json({ error: "Failed to update staff members" }, { status: 500 });
      }
    }
    
    // Update leadership sections and members
    // First, get existing sections to compare
    const { data: existingSections, error: getSectionsError } = await supabase
      .from('leadership_sections')
      .select('section_id');
      
    if (getSectionsError) {
      console.error("Error getting existing leadership sections:", getSectionsError);
      return NextResponse.json({ error: "Failed to update leadership sections" }, { status: 500 });
    }
    
    // Get list of section IDs that should be kept
    const newSectionIds = content.leadership_sections.map(section => section.id);
    
    // Delete sections that are not in the new list
    const sectionIdsToDelete = existingSections
      .filter(section => !newSectionIds.includes(section.section_id))
      .map(section => section.section_id);
      
    if (sectionIdsToDelete.length > 0) {
      const { error: deleteSectionsError } = await supabase
        .from('leadership_sections')
        .delete()
        .in('section_id', sectionIdsToDelete);
        
      if (deleteSectionsError) {
        console.error("Error deleting leadership sections:", deleteSectionsError);
        return NextResponse.json({ error: "Failed to update leadership sections" }, { status: 500 });
      }
    }
    
    // Update or insert sections and their members
    for (let i = 0; i < content.leadership_sections.length; i++) {
      const section = content.leadership_sections[i];
      
      // Check if section already exists - modified to avoid .single() error
      const { error: checkSectionError } = await supabase
        .from('leadership_sections')
        .select('*')
        .eq('section_id', section.id);
      
      if (checkSectionError) {
        console.error(`Error checking section ${section.id}:`, checkSectionError);
        return NextResponse.json({ error: "Failed to update leadership sections" }, { status: 500 });
      }
      
      // Upsert the section
      const { error: upsertSectionError } = await supabase
        .from('leadership_sections')
        .upsert({
          section_id: section.id,
          name: section.name,
          color: section.color || '#3b82f6', // Add color field
          order_number: i,
        }, { onConflict: 'section_id' });
        
      if (upsertSectionError) {
        console.error(`Error upserting section ${section.id}:`, upsertSectionError);
        return NextResponse.json({ error: "Failed to update leadership sections" }, { status: 500 });
      }
      
      // Delete existing members for this section
      const { error: deleteMembersError } = await supabase
        .from('leadership_members')
        .delete()
        .eq('section_id', section.id);
        
      if (deleteMembersError) {
        console.error(`Error deleting members for section ${section.id}:`, deleteMembersError);
        return NextResponse.json({ error: "Failed to update leadership members" }, { status: 500 });
      }
      
      // Insert new members
      const membersToInsert = section.members.map((member, memberIndex) => ({
        member_id: member.id,
        section_id: section.id,
        name: member.name,
        image_url: member.image_url,
        order_number: memberIndex
      }));
      
      if (membersToInsert.length > 0) {
        const { error: insertMembersError } = await supabase
          .from('leadership_members')
          .insert(membersToInsert);
          
        if (insertMembersError) {
          console.error(`Error inserting members for section ${section.id}:`, insertMembersError);
          return NextResponse.json({ error: "Failed to update leadership members" }, { status: 500 });
        }
      }
    }
    
    // Log the update for audit purposes
    console.info(`Homepage content updated by ${session.user.email}`);
    
    return NextResponse.json({
      message: "Homepage content updated successfully"
    });
    
  } catch (error) {
    console.error("Unexpected error in homepage content PUT endpoint:", error);
    return NextResponse.json({ 
      error: "An unexpected error occurred", 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}