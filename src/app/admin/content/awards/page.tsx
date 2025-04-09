"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2, Upload, Plus, ImageIcon } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Achievement, AwardsContent } from "@/types/awards";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

type ExtendedAchievement = Achievement & {
  imagePreview: string | null;
};

export default function AwardsContentManagement() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [contentId, setContentId] = useState<string | null>(null);
  
  // Page content state
  const [pageContent, setPageContent] = useState<Pick<AwardsContent, 'title' | 'description'>>({
    title: "",
    description: ""
  });
  
  // Achievements state
  const [achievements, setAchievements] = useState<ExtendedAchievement[]>([]);

  // Fetch content on page load
  useEffect(() => {
    async function fetchContent() {
      try {
        const response = await fetch('/api/admin/content/awards');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.content) {
          setContentId(data.content.id);
          setPageContent({
            title: data.content.title || "",
            description: data.content.description || ""
          });
          
          // Map achievements
          const fetchedAchievements = data.content.achievements.map((item: Achievement): ExtendedAchievement => ({
            id: item.id,
            title: item.title,
            imageSrc: item.imageSrc,
            imageAlt: item.imageAlt,
            imagePreview: null,
            order_number: item.order_number
          }));
          
          setAchievements(fetchedAchievements);
        }
      } catch (error) {
        console.error("Error fetching awards content:", error);
        toast.error("Failed to load content");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchContent();
  }, []);

  // Handle page content changes
  const handlePageContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPageContent(prev => ({ ...prev, [name]: value }));
  };

  // Handle achievement changes
  const handleAchievementChange = (
    index: number, 
    field: 'title' | 'imageSrc' | 'imageAlt', 
    value: string
  ) => {
    const newAchievements = [...achievements];
    newAchievements[index][field] = value;
    setAchievements(newAchievements);
  };

  // Handle image upload
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newAchievements = [...achievements];
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      newAchievements[index].imagePreview = previewUrl;
      
      // In a real scenario, we would upload the image to a server
      // For now, we'll just update the imageSrc with the filename
      // This simulates what would happen after a successful upload
      const fileName = `/CypressRanchOrchestraInstagramPhotos/${file.name}`;
      newAchievements[index].imageSrc = fileName;
      
      setAchievements(newAchievements);
    }
  };

  // Add a new achievement
  const addAchievement = () => {
    const newId = `achievement-${Date.now()}`;
    setAchievements([
      ...achievements, 
      {
        id: newId,
        title: "New Achievement",
        imageSrc: "",
        imageAlt: "Achievement image",
        imagePreview: null,
        order_number: achievements.length + 1
      }
    ]);
  };

  // Remove an achievement
  const removeAchievement = (index: number) => {
    const newAchievements = [...achievements];
    newAchievements.splice(index, 1);
    
    // Update order numbers
    const reorderedAchievements = newAchievements.map((achievement, i) => ({
      ...achievement,
      order_number: i + 1
    }));
    
    setAchievements(reorderedAchievements);
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Prepare the data payload
      const payload = {
        content: {
          id: contentId,
          title: pageContent.title,
          description: pageContent.description,
          achievements: achievements.map((achievement, index) => ({
            id: achievement.id,
            title: achievement.title,
            imageSrc: achievement.imageSrc,
            imageAlt: achievement.imageAlt,
            order_number: index + 1
          }))
        }
      };
      
      // Make API call to save data
      const response = await fetch('/api/admin/content/awards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update contentId if this was a new record
      if (result.contentId && !contentId) {
        setContentId(result.contentId);
      }
      
      // Show success message
      toast.success("Content saved successfully");
      
      // Clean up any image previews
      const clearedPreviews = achievements.map(achievement => ({
        ...achievement,
        imagePreview: null
      }));
      
      setAchievements(clearedPreviews);
      
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  // Clear image preview
  const clearImagePreview = (index: number) => {
    const newAchievements = [...achievements];
    newAchievements[index].imagePreview = null;
    setAchievements(newAchievements);
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-6 mx-auto max-w-7xl flex justify-center items-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <Toaster position="top-right" />

      <div className="mb-6">
      <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/content">Content</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/content/competitions">Competitions</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Awards Content Management</CardTitle>
          <CardDescription>
            Update the awards and achievements displayed on your website. Changes will be reflected on the live site. This website is intended to be used on a desktop device. 
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Page Header Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Page Header</CardTitle>
          <CardDescription>Edit the main title and description for the awards page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              name="title"
              value={pageContent.title}
              onChange={handlePageContentChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Page Description</Label>
            <Textarea
              id="description"
              name="description"
              value={pageContent.description}
              onChange={handlePageContentChange}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Achievements Section */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Achievements</CardTitle>
            <CardDescription>Manage the achievement cards shown on your awards page.</CardDescription>
          </div>
          <Button onClick={addAchievement} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Add Achievement
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {achievements.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <p className="text-muted-foreground mb-2">No achievements added yet</p>
              <Button onClick={addAchievement} variant="outline">
                Add Your First Achievement
              </Button>
            </div>
          ) : (
            achievements.map((achievement, index) => (
              <Card key={achievement.id} className="relative mb-6">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium">Achievement {index + 1}</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeAchievement(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`achievement_title_${index}`}>Achievement Title</Label>
                        <Input
                          id={`achievement_title_${index}`}
                          value={achievement.title}
                          onChange={(e) => handleAchievementChange(index, 'title', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`achievement_alt_${index}`}>Image Alt Text</Label>
                        <Input
                          id={`achievement_alt_${index}`}
                          value={achievement.imageAlt}
                          onChange={(e) => handleAchievementChange(index, 'imageAlt', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Briefly describe the image for accessibility purposes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label>Achievement Image</Label>
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-dashed">
                        {(achievement.imagePreview || achievement.imageSrc) ? (
                          <Image 
                            src={achievement.imagePreview || achievement.imageSrc}
                            alt={achievement.imageAlt}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-40 w-full items-center justify-center bg-muted">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                          <label htmlFor={`image_upload_${index}`}>
                            <Upload className="h-4 w-4" />
                            Choose Image
                          </label>
                        </Button>
                        <Input
                          id={`image_upload_${index}`}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleImageUpload(index, e)}
                        />
                        {(achievement.imagePreview || achievement.imageSrc) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => achievement.imagePreview ? clearImagePreview(index) : handleAchievementChange(index, 'imageSrc', '')}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                      {achievement.imageSrc && !achievement.imagePreview && (
                        <p className="text-xs text-muted-foreground">
                          Current image: {achievement.imageSrc.split('/').pop()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <Separator />
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Save Changes Button */}
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
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