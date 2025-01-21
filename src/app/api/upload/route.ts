import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BUCKET_NAME = "avatars"; // Update this to match your Supabase bucket name

// Type for upload record to match database schema
interface UploadRecord {
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
  original_name: string;
}

export async function POST(req: Request) {
  const cookieStore = await cookies();

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

  // Get Supabase auth token from cookies
  const supabaseAuthToken = cookieStore.get("sb-access-token")?.value;
  if (supabaseAuthToken) {
    supabase.auth.setSession({
      access_token: supabaseAuthToken,
      refresh_token: cookieStore.get("sb-refresh-token")?.value || "",
    });
  }

  try {
    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 },
      );
    }

    // Get and validate file data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // File validation
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPEG, PNG, or GIF" },
        { status: 400 },
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 },
      );
    }

    // Convert File to ArrayBuffer for Supabase storage
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Generate a unique file name
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: storageData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError || !storageData) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 },
      );
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storageData.path);

    if (!publicUrlData?.publicUrl) {
      console.error("Failed to generate public URL");
      return NextResponse.json(
        { error: "Could not generate public URL" },
        { status: 500 },
      );
    }

    // Prepare upload record
    const uploadRecord: UploadRecord = {
      user_id: user.id,
      file_name: storageData.path,
      file_type: file.type,
      file_size: file.size,
      public_url: publicUrlData.publicUrl,
      original_name: file.name,
    };

    // Save metadata to the database
    const { error: dbError } = await supabase
      .from("uploads")
      .insert([uploadRecord]);

    if (dbError) {
      console.error("Database error:", dbError);

      // Cleanup uploaded file on database failure
      await supabase.storage.from(BUCKET_NAME).remove([storageData.path]);

      return NextResponse.json(
        { error: "Failed to save file metadata" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      fileName: storageData.path,
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
