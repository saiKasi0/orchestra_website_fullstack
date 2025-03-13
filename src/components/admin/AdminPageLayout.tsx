"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AdminPageLayoutProps = {
  children: React.ReactNode;
  allowedRoles: string[];
  title?: string;
};

export function AdminPageLayout({
  children,
  allowedRoles,
  title = "Admin Dashboard"
}: AdminPageLayoutProps) {
  const { isAuthorized, isLoading, session } = useAdminAuth({ allowedRoles });
  const router = useRouter();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/admin");
      toast?.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast?.error("Failed to sign out");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-[400px] space-y-4">
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    // This won't usually show as the hook already handles redirects
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Welcome, {session?.user?.name || session?.user?.role || 'User'}
              </span>
              
              {/* Sign Out Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut} 
                className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 mt-5">
        {children}
      </div>
    </div>
  );
}