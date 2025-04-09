import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { tripsContentSchema } from "@/types/trips";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { v4 as uuidv4 } from "uuid";

// GET endpoint for trips content
export async function GET(req: Request) {
  try {
    const supabase = createClient();
    
    // Query trips content
    const { data: tripsData, error: tripsError } = await supabase
      .from('trips_content')
      .select('*')
      .single();
      
    if (tripsError) {
      console.error("Error fetching trips data:", tripsError);
      
      // If no record exists yet, return default values
      if (tripsError.code === 'PGRST116') {
        return NextResponse.json({ 
          content: {
            page_title: "Orchestra Trips & Socials",
            page_subtitle: "Explore our adventures and memorable moments",
            quote: "Thank you to everyone who makes these moments unforgettable. We're excited for the upcoming socials and journeys this year. Stay tuned for announcements on our next adventure!",
            gallery_images: [
              { id: "img1", src: "/CypressRanchOrchestraInstagramPhotos/CocoSocial.jpg", order_number: 1 },
              { id: "img2", src: "/CypressRanchOrchestraInstagramPhotos/HoustonSymphonyMargianos.jpg", order_number: 2 },
              { id: "img3", src: "/CypressRanchOrchestraInstagramPhotos/HoustonSymphony.jpg", order_number: 3 },
              { id: "img4", src: "/CypressRanchOrchestraInstagramPhotos/HoustonSymphonyTripArcade.jpg", order_number: 4 },
              { id: "img5", src: "/CypressRanchOrchestraInstagramPhotos/Disney2023.jpg", order_number: 5 }
            ],
            feature_items: [
              {
                id: "feature1",
                icon: "MusicNote",
                title: "More Than Just Music",
                description: "Being part of our orchestra is about creating beautiful music and forming lasting friendships. We believe that the bonds formed off-stage are just as important as the harmony we create on-stage.",
                order_number: 1
              },
              {
                id: "feature2",
                icon: "MapPin",
                title: "Exciting Adventures",
                description: "From weekend retreats to city trips, each event is a chance to unwind, explore, and connect in new ways. We've explored museums, attended professional concerts, and even had fun at theme parks!",
                order_number: 2
              },
              {
                id: "feature3",
                icon: "Users",
                title: "Unforgettable Moments",
                description: "These experiences bring us together, whether it's sightseeing, enjoying group dinners, or simply having fun. The memories we create during these trips last a lifetime and strengthen our musical connection.",
                order_number: 3
              }
            ]
          }
        });
      }
      
      return NextResponse.json({ error: "Failed to fetch trips content" }, { status: 500 });
    }
    
    // Fetch gallery images
    const { data: galleryImages, error: galleryError } = await supabase
      .from('trips_gallery_images')
      .select('*')
      .eq('content_id', tripsData.id)
      .order('order_number', { ascending: true });
      
    if (galleryError) {
      console.error("Error fetching gallery images:", galleryError);
      return NextResponse.json({ error: "Failed to fetch gallery images" }, { status: 500 });
    }
    
    // Fetch feature items
    const { data: featureItems, error: featureError } = await supabase
      .from('trips_feature_items')
      .select('*')
      .eq('content_id', tripsData.id)
      .order('order_number', { ascending: true });
      
    if (featureError) {
      console.error("Error fetching feature items:", featureError);
      return NextResponse.json({ error: "Failed to fetch feature items" }, { status: 500 });
    }
    
    // Combine the data
    const content = {
      ...tripsData,
      gallery_images: galleryImages || [],
      feature_items: featureItems || []
    };
    
    return NextResponse.json({ content });
    
  } catch (error) {
    console.error("Unexpected error in trips content GET endpoint:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// PUT endpoint for trips content
export async function PUT(req: Request) {
  try {
    // Check authentication - only admins or leadership users can update content
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "admin" && session.user.role !== "leadership")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Parse and validate the request body
    const body = await req.json();
    const contentValidation = tripsContentSchema.safeParse(body);
    
    if (!contentValidation.success) {
      return NextResponse.json(
        { error: "Invalid data format", details: contentValidation.error.format() }, 
        { status: 400 }
      );
    }
    
    const content = contentValidation.data;
    const supabase = createClient();
    
    // Begin a transaction by wrapping everything in a try/catch
    try {
      // Update or create the main content record
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips_content')
        .upsert({
          id: content.id || uuidv4(),
          page_title: content.page_title,
          page_subtitle: content.page_subtitle,
          quote: content.quote,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (tripsError) {
        throw tripsError;
      }
      
      // Get the content ID (either existing or newly created)
      const contentId = tripsData.id;
      
      // Delete existing gallery images for this content to replace them
      const { error: deleteGalleryError } = await supabase
        .from('trips_gallery_images')
        .delete()
        .eq('content_id', contentId);
      
      if (deleteGalleryError) {
        throw deleteGalleryError;
      }
      
      // Add the new gallery images with the correct order
      if (content.gallery_images && content.gallery_images.length > 0) {
        const galleryImagesToInsert = content.gallery_images.map((image, index) => ({
          id: image.id || uuidv4(),
          content_id: contentId,
          src: image.src,
          order_number: index + 1
        }));
        
        const { error: insertGalleryError } = await supabase
          .from('trips_gallery_images')
          .insert(galleryImagesToInsert);
        
        if (insertGalleryError) {
          throw insertGalleryError;
        }
      }
      
      // Delete existing feature items for this content to replace them
      const { error: deleteFeatureError } = await supabase
        .from('trips_feature_items')
        .delete()
        .eq('content_id', contentId);
      
      if (deleteFeatureError) {
        throw deleteFeatureError;
      }
      
      // Add the new feature items with the correct order
      if (content.feature_items && content.feature_items.length > 0) {
        const featureItemsToInsert = content.feature_items.map((item, index) => ({
          id: item.id || uuidv4(),
          content_id: contentId,
          icon: item.icon,
          title: item.title,
          description: item.description,
          order_number: index + 1
        }));
        
        const { error: insertFeatureError } = await supabase
          .from('trips_feature_items')
          .insert(featureItemsToInsert);
        
        if (insertFeatureError) {
          throw insertFeatureError;
        }
      }
      
      return NextResponse.json({
        success: true,
        contentId
      });
      
    } catch (dbError) {
      console.error("Database error while updating trips content:", dbError);
      return NextResponse.json({ error: "Failed to update trips content" }, { status: 500 });
    }
    
  } catch (error) {
    console.error("Unexpected error in trips content PUT endpoint:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
