import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET endpoint for trips content (public)
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
              { id: "img1", src: "/CypressRanchOrchestraInstagramPhotos/CocoSocial.jpg" },
              { id: "img2", src: "/CypressRanchOrchestraInstagramPhotos/HoustonSymphonyMargianos.jpg" },
              { id: "img3", src: "/CypressRanchOrchestraInstagramPhotos/HoustonSymphony.jpg" },
              { id: "img4", src: "/CypressRanchOrchestraInstagramPhotos/HoustonSymphonyTripArcade.jpg" },
              { id: "img5", src: "/CypressRanchOrchestraInstagramPhotos/Disney2023.jpg" }
            ],
            feature_items: [
              {
                id: "feature1",
                icon: "MusicNote",
                title: "More Than Just Music",
                description: "Being part of our orchestra is about creating beautiful music and forming lasting friendships. We believe that the bonds formed off-stage are just as important as the harmony we create on-stage."
              },
              {
                id: "feature2",
                icon: "MapPin",
                title: "Exciting Adventures",
                description: "From weekend retreats to city trips, each event is a chance to unwind, explore, and connect in new ways. We've explored museums, attended professional concerts, and even had fun at theme parks!"
              },
              {
                id: "feature3",
                icon: "Users",
                title: "Unforgettable Moments",
                description: "These experiences bring us together, whether it's sightseeing, enjoying group dinners, or simply having fun. The memories we create during these trips last a lifetime and strengthen our musical connection."
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
