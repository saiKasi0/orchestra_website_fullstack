"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2, Upload, Plus, ImageIcon } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function AwardsContentManagement() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Page content state
  const [pageContent, setPageContent] = useState({
    title: "Cypress Ranch Orchestra's Achievements",
    description: "The Cypress Ranch Orchestra has consistently achieved remarkable success, earning a wide array of prestigious accolades across our various ensembles and competitions. From local and regional contests to state and national festivals, our orchestra's dedication to excellence has been recognized time and time again."
  });
  
  // Achievements state
  const [achievements, setAchievements] = useState([
    {
      id: "1",
      title: "Most Area 27 Region Players in CFISD!",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/Region2023.jpg",
      imageAlt: "Cypress Ranch Orchestra Region players posing for a group photo",
      imagePreview: null
    },
    {
      id: "2",
      title: "Varsity UIL Orchestra Division 1 Rating",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/Chamber2024Uil.jpg",
      imageAlt: "Varsity UIL Orchestra performing at UIL competition",
      imagePreview: null
    },
    {
      id: "3",
      title: "Sub-Non-Varsity A UIL Orchestra Division 1 Rating",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/Symphony2024Uil.jpg",
      imageAlt: "Sub-Non-Varsity A UIL Orchestra performing at UIL competition",
      imagePreview: null
    },
    {
      id: "4",
      title: "Festival Disney Golden Mickey & String Orchestra Best in Class",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/Disney2023.jpg",
      imageAlt: "Cypress Ranch Orchestra winning Golden Mickey at Disney event",
      imagePreview: null
    },
    {
      id: "5",
      title: "Symphony - Commended Winner, Citation of Excellence 2024",
      imageSrc: "/CypressRanchOrchestraInstagramPhotos/SymphonyCitationOfExcellence.jpg",
      imageAlt: "Symphony orchestra receiving Citation of Excellence award",
      imagePreview: null
    }
  ]);

  // Handle page content changes
  const handlePageContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPageContent(prev => ({ ...prev, [name]: value }));
  };

  // Handle achievement changes
  const handleAchievementChange = (index: number, field: string, value: string) => {
    const newAchievements = [...achievements];
    // @ts-expect-error - We know these fields exist
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
      setAchievements(newAchievements);
      
      // TODO: Implement actual file upload to backend/storage
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
        imagePreview: null
      }
    ]);
  };

  // Remove an achievement
  const removeAchievement = (index: number) => {
    const newAchievements = [...achievements];
    newAchievements.splice(index, 1);
    setAchievements(newAchievements);
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Implement API call to save data
      // 1. Save page content (title, description)
      // 2. Save achievements (including image uploads)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Show success message
    } catch (error) {
      // TODO: Handle error and show error message
      console.error("Error saving content:", error);
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

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
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
            <BreadcrumbLink href="/admin/content/awards">Awards</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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