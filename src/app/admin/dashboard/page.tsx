"use client";

import { useSession } from "next-auth/react";
import { 
  Users, 
  FileEdit, 
  Calendar
} from "lucide-react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  
  return (
    <AdminPageLayout allowedRoles={["admin", "student"]} title="Admin Dashboard">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Users Card - Only visible to admins */}
        {isAdmin && (
          <Card>
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
        
        {/* Content Card - Available to both roles */}
        <Card>
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
        
        {/* Events Card - Available to both roles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Events</CardTitle>
            <Calendar className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <CardDescription>Manage orchestra events and calendar</CardDescription>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/admin/events" className="flex items-center justify-center">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Events
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminPageLayout>
  );
}