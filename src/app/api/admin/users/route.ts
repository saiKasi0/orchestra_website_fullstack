import { NextResponse, NextRequest } from "next/server"; // Import NextRequest
import { getServerSession } from "next-auth";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { apiRateLimiter, getIdentifier } from '@/utils/rateLimiter'; // Import rate limiter and helper

// Schema validation for POST request
const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  fullName: z.string().min(1, "Full name is required"),
  role: z.enum(["admin", "leadership"]),
  password: z.string()
    .min(10, "Password must be at least 10 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

// Get all users
export async function GET(req: NextRequest) { // Use NextRequest
  // --- Rate Limiting Start ---
  if (apiRateLimiter) {
      const identifier = getIdentifier(req);
      if (identifier) {
          const { success } = await apiRateLimiter.limit(identifier);
          if (!success) {
              console.warn(`Rate limit exceeded for GET /api/admin/users by IP: ${identifier}`);
              return NextResponse.json({ error: "Too many requests" }, { status: 429 });
          }
      } else {
          console.warn("Could not determine identifier for rate limiting GET /api/admin/users");
          // Optionally block if identifier is missing, or allow
      }
  }
  // --- Rate Limiting End ---

  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }
    
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Insufficient permissions" }, { status: 403 });
    }
    
    // Create Supabase client
    const supabase = createClient();
    
    // Query profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching users from Supabase:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
    
    return NextResponse.json({ users: data });
    
  } catch (error) {
    console.error("Unexpected error fetching users:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// Create a new user
export async function POST(req: NextRequest) { // Use NextRequest
  // --- Rate Limiting Start ---
  if (apiRateLimiter) {
      const identifier = getIdentifier(req);
      if (identifier) {
          const { success } = await apiRateLimiter.limit(identifier);
          if (!success) {
              console.warn(`Rate limit exceeded for POST /api/admin/users by IP: ${identifier}`);
              return NextResponse.json({ error: "Too many requests" }, { status: 429 });
          }
      } else {
          console.warn("Could not determine identifier for rate limiting POST /api/admin/users");
          // Optionally block if identifier is missing, or allow and log
      }
  }
  // --- Rate Limiting End ---

  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized - No session" }, { status: 401 });
    }
    
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - Insufficient permissions" }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = createUserSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: result.error.format() 
      }, { status: 400 });
    }
    
    const { email, fullName, role, password } = result.data;
    
    // Create Supabase client
    const supabase = createClient();
    
    // Check for existing user with the same email
    const { data: existingUser, error: lookupError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();
    
    if (lookupError) {
      console.error("Error checking for existing user:", lookupError);
      return NextResponse.json({ error: "Error checking for existing user" }, { status: 500 });
    }
    
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }
    
    console.log(`Creating new user: ${email} (initiated by ${session.user.email})`);
    
    // Step 1: Create user in Supabase Auth with the provided password
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (authError || !authData.user) {
      console.error("Error creating auth user:", authError);
      return NextResponse.json({ 
        error: "Failed to create user", 
        message: authError?.message || "Unknown auth error" 
      }, { status: 500 });
    }
    
    // Step 2: Insert user into profiles table with specified role
    const { error: dbError } = await supabase.from('profiles').insert({
      auth_id: authData.user.id,
      full_name: fullName,
      email: email.toLowerCase(),
      role
    });
    
    if (dbError) {
      console.error("Error creating profile:", dbError);
      
      // Clean up auth user if profile creation fails
      const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
      if (deleteError) {
        console.error("Failed to clean up auth user after profile creation failure:", deleteError);
      }
      
      return NextResponse.json({ 
        error: "Failed to create user profile", 
        message: dbError.message 
      }, { status: 500 });
    }
    
    // Log user creation for audit purposes
    console.info(`User created successfully: ${email} by ${session.user.email}`);
    
    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: authData.user.id,
        email: email,
        fullName: fullName,
        role: role
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Unexpected error creating user:", error);
    return NextResponse.json({ 
      error: "An unexpected error occurred", 
      message: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}