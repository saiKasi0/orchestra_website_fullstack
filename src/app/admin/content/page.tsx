"use client";

import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Home,
  Trophy, 
  Music, 
  BookOpen, 
  Plane 
} from "lucide-react";

export default function ContentManagement() {
  return (
    <AdminPageLayout allowedRoles={["admin", "student"]} title="Content Management">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Website Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Select a section below to edit its content. Changes will be reflected on the live website.
          </p>
        </CardContent>
      </Card>
    
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Homepage */}
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Homepage</CardTitle>
            <Home className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <CardDescription>Edit the main homepage content and featured sections</CardDescription>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/content/homepage" className="flex items-center justify-center">
                <Home className="mr-2 h-4 w-4" />
                Edit Homepage
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Competitions Page */}
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Competitions</CardTitle>
            <Trophy className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <CardDescription>Manage competition information and achievements</CardDescription>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/admin/content/competitions" className="flex items-center justify-center">
                <Trophy className="mr-2 h-4 w-4" />
                Edit Competitions
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Concerts Page */}
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Concerts</CardTitle>
            <Music className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <CardDescription>Manage concert information, programs and schedules</CardDescription>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/admin/content/concerts" className="flex items-center justify-center">
                <Music className="mr-2 h-4 w-4" />
                Edit Concerts
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Resources Page */}
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Resources</CardTitle>
            <BookOpen className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <CardDescription>Manage resources, calendars and educational content</CardDescription>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/admin/content/resources" className="flex items-center justify-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Edit Resources
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Trips Page */}
        <Card className="border-l-4 border-l-indigo-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Trips & Socials</CardTitle>
            <Plane className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <CardDescription>Manage trip information, galleries and event details</CardDescription>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/admin/content/trips" className="flex items-center justify-center">
                <Plane className="mr-2 h-4 w-4" />
                Edit Trips & Socials
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminPageLayout>
  );
}