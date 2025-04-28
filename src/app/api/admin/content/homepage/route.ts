import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { homepageContentSchema } from "@/types/homepage";
import { v4 as uuidv4 } from "uuid";
import { uploadBase64Image, deleteStorageObject } from '@/utils/imageUtils';

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
  const requestId = uuidv4(); // Generate a request ID for logging
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
    const BUCKET_NAME = 'homepage-images';

    // --- Fetch Current Data for Comparison ---
    let oldHeroImageUrl: string | null = null;
    let oldStaffMembers: { id: string | number, image_url: string | null }[] = [];
    let oldLeadershipMembers: { id: string | number, image_url: string | null }[] = [];

    // Fetch current homepage content (for hero image)
    const { data: currentHomepageData, error: fetchHomepageError } = await supabase
      .from('homepage_content')
      .select('hero_image_url')
      .eq('id', 1)
      .maybeSingle();
    if (currentHomepageData) oldHeroImageUrl = currentHomepageData.hero_image_url;

    // Fetch current staff members (for images)
    const { data: currentStaffData, error: fetchStaffError } = await supabase
      .from('staff_members')
      .select('member_id, image_url');
    if (currentStaffData) oldStaffMembers = currentStaffData.map(s => ({ id: s.member_id, image_url: s.image_url }));

    // Fetch current leadership members (for images)
    const { data: currentLeadershipData, error: fetchLeadershipError } = await supabase
      .from('leadership_members')
      .select('member_id, image_url');
    if (currentLeadershipData) oldLeadershipMembers = currentLeadershipData.map(l => ({ id: l.member_id, image_url: l.image_url }));

    if (fetchHomepageError) console.warn("Error fetching current homepage data:", fetchHomepageError.message);
    if (fetchStaffError) console.warn("Error fetching current staff data:", fetchStaffError.message);
    if (fetchLeadershipError) console.warn("Error fetching current leadership data:", fetchLeadershipError.message);

    // --- Process Incoming Images (Upload Base64, Keep URLs) ---
    let finalHeroImageUrl = content.hero_image_url;
    if (content.hero_image_url && content.hero_image_url.startsWith('data:image')) {
      console.log(`[${requestId}] Processing base64 hero image...`);
      const uploadedUrl = await uploadBase64Image(
        supabase,
        BUCKET_NAME,
        content.hero_image_url,
        'hero_images/', // Path prefix
        requestId
      );
      if (uploadedUrl) {
        finalHeroImageUrl = uploadedUrl;
        console.log(`[${requestId}] Uploaded new hero image: ${finalHeroImageUrl}`);
      } else {
        console.error(`[${requestId}] Failed to upload hero image.`);
        finalHeroImageUrl = oldHeroImageUrl ?? undefined;
      }
    }

    if (content.staff_members && content.staff_members.length > 0) {
      for (let i = 0; i < content.staff_members.length; i++) {
        const member = content.staff_members[i];
        if (member.image_url && member.image_url.startsWith('data:image')) {
          console.log(`[${requestId}] Processing base64 staff image for ${member.name}...`);
          const uploadedUrl = await uploadBase64Image(
            supabase,
            BUCKET_NAME,
            member.image_url,
            'staff_images/', // Path prefix
            requestId
          );
          if (uploadedUrl) {
            content.staff_members[i].image_url = uploadedUrl;
            console.log(`[${requestId}] Uploaded new staff image for ${member.name}: ${uploadedUrl}`);
          } else {
            console.error(`[${requestId}] Failed to upload staff image for ${member.name}.`);
            const oldMember = oldStaffMembers.find(m => m.id === member.id);
            content.staff_members[i].image_url = oldMember?.image_url ?? "";
          }
        }
      }
    }

    if (content.leadership_sections && content.leadership_sections.length > 0) {
      for (const section of content.leadership_sections) {
        if (section.members && section.members.length > 0) {
          for (let i = 0; i < section.members.length; i++) {
            const member = section.members[i];
            if (member.image_url && member.image_url.startsWith('data:image')) {
              console.log(`[${requestId}] Processing base64 leadership image for ${member.name}...`);
              const uploadedUrl = await uploadBase64Image(
                supabase,
                BUCKET_NAME,
                member.image_url,
                'leadership_images/', // Path prefix
                requestId
              );
              if (uploadedUrl) {
                section.members[i].image_url = uploadedUrl;
                console.log(`[${requestId}] Uploaded new leadership image for ${member.name}: ${uploadedUrl}`);
              } else {
                console.error(`[${requestId}] Failed to upload leadership image for ${member.name}.`);
                const oldMember = oldLeadershipMembers.find(m => m.id === member.id);
                section.members[i].image_url = oldMember?.image_url ?? "";
              }
            }
          }
        }
      }
    }

    // --- Delete Unused Images from Storage ---
    if (oldHeroImageUrl && oldHeroImageUrl !== finalHeroImageUrl && oldHeroImageUrl.includes(`/${BUCKET_NAME}/`)) {
      console.log(`[${requestId}] Deleting old hero image: ${oldHeroImageUrl}`);
      await deleteStorageObject(supabase, BUCKET_NAME, oldHeroImageUrl, requestId);
    } else if (oldHeroImageUrl && !finalHeroImageUrl && oldHeroImageUrl.includes(`/${BUCKET_NAME}/`)) {
      console.log(`[${requestId}] Hero image removed, deleting old: ${oldHeroImageUrl}`);
      await deleteStorageObject(supabase, BUCKET_NAME, oldHeroImageUrl, requestId);
    }

    const finalStaffImageUrls = new Set(content.staff_members.map(m => m.image_url).filter(Boolean));
    const staffUrlsToDelete = oldStaffMembers
        .map(m => m.image_url)
        .filter(url => url && url.includes(`/${BUCKET_NAME}/staff_images/`) && !finalStaffImageUrls.has(url));
    if (staffUrlsToDelete.length > 0) {
        console.log(`[${requestId}] Deleting ${staffUrlsToDelete.length} unused staff images...`);
        for (const url of staffUrlsToDelete) {
            await deleteStorageObject(supabase, BUCKET_NAME, url, requestId);
        }
    }

    const finalLeadershipImageUrls = new Set(
        content.leadership_sections.flatMap(s => s.members.map(m => m.image_url)).filter(Boolean)
    );
    const leadershipUrlsToDelete = oldLeadershipMembers
        .map(m => m.image_url)
        .filter(url => url && url.includes(`/${BUCKET_NAME}/leadership_images/`) && !finalLeadershipImageUrls.has(url));
     if (leadershipUrlsToDelete.length > 0) {
        console.log(`[${requestId}] Deleting ${leadershipUrlsToDelete.length} unused leadership images...`);
        for (const url of leadershipUrlsToDelete) {
            await deleteStorageObject(supabase, BUCKET_NAME, url, requestId);
        }
    }

    // Update basic content in homepage_content table
    const { error: updateError } = await supabase
      .from('homepage_content')
      .update({
        hero_image_url: finalHeroImageUrl ?? undefined,
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
      .eq('id', 1);
    
    if (updateError) {
      console.error("Error updating homepage content:", updateError);
      return NextResponse.json({ error: "Failed to update homepage content" }, { status: 500 });
    }
    
    // Update event cards
    const { error: deleteCardsError } = await supabase
      .from('homepage_event_cards')
      .delete()
      .neq('id', 0);
      
    if (deleteCardsError) {
      console.error("Error deleting event cards:", deleteCardsError);
      return NextResponse.json({ error: "Failed to update event cards" }, { status: 500 });
    }
    
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
    const { error: deleteStaffError } = await supabase
      .from('staff_members')
      .delete()
      .neq('id', 0);
      
    if (deleteStaffError) {
      console.error("Error deleting staff members:", deleteStaffError);
      return NextResponse.json({ error: "Failed to update staff members" }, { status: 500 });
    }
    
    const staffMembersToInsert = content.staff_members.map((member, index) => ({
      member_id: member.id,
      name: member.name,
      position: member.position,
      image_url: member.image_url ?? undefined,
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
    const { data: existingSections, error: getSectionsError } = await supabase
      .from('leadership_sections')
      .select('section_id');
      
    if (getSectionsError) {
      console.error("Error getting existing leadership sections:", getSectionsError);
      return NextResponse.json({ error: "Failed to update leadership sections" }, { status: 500 });
    }
    
    const newSectionIds = content.leadership_sections.map(section => section.id);
    
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
    
    for (let i = 0; i < content.leadership_sections.length; i++) {
      const section = content.leadership_sections[i];
      
      const { error: checkSectionError } = await supabase
        .from('leadership_sections')
        .select('*')
        .eq('section_id', section.id);
      
      if (checkSectionError) {
        console.error(`Error checking section ${section.id}:`, checkSectionError);
        return NextResponse.json({ error: "Failed to update leadership sections" }, { status: 500 });
      }
      
      const { error: upsertSectionError } = await supabase
        .from('leadership_sections')
        .upsert({
          section_id: section.id,
          name: section.name,
          color: section.color || '#3b82f6',
          order_number: i,
        }, { onConflict: 'section_id' });
        
      if (upsertSectionError) {
        console.error(`Error upserting section ${section.id}:`, upsertSectionError);
        return NextResponse.json({ error: "Failed to update leadership sections" }, { status: 500 });
      }
      
      const { error: deleteMembersError } = await supabase
        .from('leadership_members')
        .delete()
        .eq('section_id', section.id);
        
      if (deleteMembersError) {
        console.error(`Error deleting members for section ${section.id}:`, deleteMembersError);
        return NextResponse.json({ error: "Failed to update leadership members" }, { status: 500 });
      }
      
      const membersToInsert = section.members.map((member, memberIndex) => ({
        member_id: member.id,
        section_id: section.id,
        name: member.name,
        image_url: member.image_url ?? undefined,
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
    
    console.info(`[${requestId}] Homepage content updated by ${session.user.email}`);
    
    return NextResponse.json({
      message: "Homepage content updated successfully"
    });
    
  } catch (error) {
    console.error(`[${requestId}] Unexpected error in homepage content PUT endpoint:`, error);
    return NextResponse.json({ 
      error: "An unexpected error occurred", 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}