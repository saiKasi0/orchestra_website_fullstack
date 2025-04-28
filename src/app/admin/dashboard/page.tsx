"use client";

import { useSession } from "next-auth/react";
import { 
  Users, 
  FileEdit,
  LayoutDashboard,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name || "User";
  
  return (
    <AdminPageLayout allowedRoles={["admin", "super_admin"]} title="Admin Dashboard">
      {/* Welcome Card - Spans full width */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-medium">Welcome, {userName}</CardTitle>
            <CardDescription className="mt-2">
              {isAdmin 
                ? "You have full administrative access to manage the website" 
                : "You can edit and manage website content"
              }
            </CardDescription>
          </div>
          <LayoutDashboard className="h-6 w-6 text-indigo-600" />
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Use the cards below to navigate to different management sections.
          </p>
        </CardContent>
      </Card>
      
      <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-2' : ''} gap-6`}>
        {/* Users Card - Only visible to admins */}
        {isAdmin && (
          <Card className="border-l-4 border-l-indigo-600">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Users</CardTitle>
              <Users className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/admin/users" className="flex items-center justify-center">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Content Card - Available to Leadership & Admin */}
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Content</CardTitle>
            <FileEdit className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <CardDescription>Manage website content and pages</CardDescription>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/admin/content" className="flex items-center justify-center">
                <FileEdit className="mr-2 h-4 w-4" />
                Edit Content
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminPageLayout>
  );
}