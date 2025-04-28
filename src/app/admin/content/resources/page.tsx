"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { ResourcesContent } from "@/types/resources";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function ResourcesContentManagementPage() {
  return (
    <AdminPageLayout allowedRoles={["admin", "'leadership'"]} title="Resources Content Management">
      <div className="space-y-6">
        <ResourcesContentManagement />
      </div>
    </AdminPageLayout>
  );
}

function ResourcesContentManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for resources content - remove id
  const [content, setContent] = useState<ResourcesContent>({
    calendar_url: "",
    support_title: "",
    youtube_url: "",
  });

  // Fetch initial data
  useEffect(() => {
    const fetchResourcesContent = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/content/resources');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.content) {
          // Update the content state - no id needed
          setContent({
            calendar_url: data.content.calendar_url || "",
            support_title: data.content.support_title || "Just For Some Support :)",
            youtube_url: data.content.youtube_url || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch resources content:", error);
        toast.error("Failed to load resources content", {
          description: "There was an error loading the content. Please try refreshing the page."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResourcesContent();
  }, []);

  // Handle content text changes
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  // Copy URL to clipboard
  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  // Save function that sends data to API
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Send the data (without id) to the API
      const response = await fetch('/api/admin/content/resources', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content) // Send state which doesn't have id
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update resources content');
      }
      
      // Show success message
      toast.success("Resources content updated", {
        description: "Your changes have been saved successfully."
      });
      
      // Refresh the page content (optional)
      router.refresh();
      
    } catch (error) {
      console.error("Failed to save resources content:", error);
      toast.error("Failed to save changes", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading resources content...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resources Page Management</CardTitle>
          <CardDescription>
            Update the content of your website&apos;s resources page. The changes will be reflected on the live site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Currently Published Content</h3>
            <p>Calendar URL: <span className="font-mono text-xs break-all">{content.calendar_url || "(empty)"}</span></p>
            <p>Support Section Title: <span className="font-mono">{content.support_title || "(empty)"}</span></p>
            <p>YouTube Video URL: <span className="font-mono text-xs break-all">{content.youtube_url || "(empty)"}</span></p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="support">Support Video</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Orchestra Calendar</CardTitle>
              <CardDescription>
                Update the Google Calendar embed that is displayed on your resources page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="calendar_url" className="text-sm font-medium">
                    Calendar Embed URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="calendar_url"
                      name="calendar_url"
                      value={content.calendar_url ?? ''} // Use ?? '' to handle null/undefined
                      onChange={handleContentChange}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleCopyToClipboard(content.calendar_url ?? '', "URL")} // Also handle null here
                      title="Copy URL"
                      disabled={!content.calendar_url} // Disable if no URL
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The full Google Calendar embed URL from your Google Calendar settings.
                  </p>
                </div>

             
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle>Support Video Section</CardTitle>
              <CardDescription>
                Update the video and title in the support section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="support_title" className="text-sm font-medium">
                    Section Title
                  </Label>
                  <Input
                    id="support_title"
                    name="support_title"
                    value={content.support_title ?? ''} // Use ?? '' to handle null/undefined
                    onChange={handleContentChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube_url" className="text-sm font-medium">
                    YouTube Embed URL
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="youtube_url"
                      name="youtube_url"
                      value={content.youtube_url ?? ''} // Use ?? '' to handle null/undefined
                      onChange={handleContentChange}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleCopyToClipboard(content.youtube_url ?? '', "URL")} // Also handle null here
                      title="Copy URL"
                      disabled={!content.youtube_url} // Disable if no URL
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The full YouTube video embed URL (https://www.youtube.com/embed/VIDEO_ID).
                  </p>
                </div>

                <div>

                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}