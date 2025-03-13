import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Schema validation for PATCH request
const updateUserSchema = z.object({
  role: z.enum(["admin", "student"]),
});

// Update a user (role only for security)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    
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
    const result = updateUserSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ 
        error: "Validation error", 
        details: result.error.format() 
      }, { status: 400 });
    }
    
    const { role } = result.data;
    
    // Create Supabase client
    const supabase = createClient();
    
    // First, check if user exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (lookupError || !existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Prevent self-role change as a safety measure
    if (existingUser.email === session.user.email) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 403 });
    }
    
    // Update the user role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Error updating user:", updateError);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
    
    // Log update for audit purposes
    console.info(`User (ID: ${userId}) role updated to ${role} by ${session.user.email}`);
    
    return NextResponse.json({
      message: "User updated successfully"
    });
    
  } catch (error) {
    console.error("Unexpected error during user update:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

// Delete a user
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    
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
    
    // First, check if user exists and get auth_id
    const { data: existingUser, error: lookupError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (lookupError || !existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Prevent self-deletion as a safety measure
    if (existingUser.email === session.user.email) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 403 });
    }
    
    // Delete the user from Supabase Auth
    // This will cascade delete the profile due to the FK constraint
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.auth_id);
    
    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
    
    // Log deletion for audit purposes
    console.info(`User ${existingUser.email} (ID: ${userId}) deleted by ${session.user.email}`);
    
    return NextResponse.json({
      message: "User deleted successfully"
    });
    
  } catch (error) {
    console.error("Unexpected error during user deletion:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}