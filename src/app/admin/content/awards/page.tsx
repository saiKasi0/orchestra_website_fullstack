"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2, Upload, Plus, ImageIcon, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
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
  
  // Add state for validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

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
          
          // Map achievements - ensure all fields have default values
          const fetchedAchievements = data.content.achievements.map((item: Achievement): ExtendedAchievement => ({
            id: item.id || `temp-${Date.now()}-${Math.random()}`,
            title: item.title || "",
            imageSrc: item.imageSrc || "",
            imageAlt: item.imageAlt || "",
            imagePreview: null,
            order_number: item.order_number || 0
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

  // Handle achievement changes - ensure values are never undefined
  const handleAchievementChange = (
    index: number, 
    field: 'title' | 'imageSrc' | 'imageAlt', 
    value: string
  ) => {
    const newAchievements = [...achievements];
    newAchievements[index][field] = value || "";
    setAchievements(newAchievements);
  };

  // Handle image upload
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for UI display
      const previewUrl = URL.createObjectURL(file);
      
      // Convert the file to base64 for API submission
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newAchievements = [...achievements];
        newAchievements[index].imagePreview = previewUrl;
        newAchievements[index].imageSrc = base64String; // Store base64 string for API
        setAchievements(newAchievements);
      };
      
      reader.onerror = () => {
        console.error("Error reading file");
        toast.error("Failed to process image");
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Add a new achievement - use empty values with placeholders instead of defaults
  const addAchievement = () => {
    const newId = `achievement-${Date.now()}`;
    setAchievements([
      ...achievements, 
      {
        id: newId,
        title: "",
        imageSrc: "",
        imageAlt: "",
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

  // Move achievement up in the order
  const moveAchievementUp = (index: number) => {
    if (index === 0) return; // Already at the top
    
    const newAchievements = [...achievements];
    const temp = newAchievements[index];
    newAchievements[index] = newAchievements[index - 1];
    newAchievements[index - 1] = temp;
    
    // Update order numbers
    const reorderedAchievements = newAchievements.map((achievement, i) => ({
      ...achievement,
      order_number: i + 1
    }));
    
    setAchievements(reorderedAchievements);
  };

  // Move achievement down in the order
  const moveAchievementDown = (index: number) => {
    if (index === achievements.length - 1) return; // Already at the bottom
    
    const newAchievements = [...achievements];
    const temp = newAchievements[index];
    newAchievements[index] = newAchievements[index + 1];
    newAchievements[index + 1] = temp;
    
    // Update order numbers
    const reorderedAchievements = newAchievements.map((achievement, i) => ({
      ...achievement,
      order_number: i + 1
    }));
    
    setAchievements(reorderedAchievements);
  };

  // Save changes with validation
  const handleSave = async () => {
    // Client-side validation before saving
    const errors: Record<string, string[]> = {};
    
    // Validate page content
    if (!pageContent.title.trim()) {
      errors["pageTitle"] = ["Page title is required"];
    }
    
    if (!pageContent.description.trim()) {
      errors["pageDescription"] = ["Page description is required"];
    }
    
    // Validate achievements
    achievements.forEach((achievement, index) => {
      if (!achievement.title.trim()) {
        errors[`achievement_${index}_title`] = ["Achievement title is required"];
      }
      
      if (!achievement.imageAlt.trim()) {
        errors[`achievement_${index}_imageAlt`] = ["Image alt text is required"];
      }
      
      if (!achievement.imageSrc.trim()) {
        errors[`achievement_${index}_imageSrc`] = ["An image is required"];
      }
    });
    
    // If we have validation errors, show them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error("Please fix the validation errors before saving");
      return;
    }
    
    // Clear any previous validation errors
    setValidationErrors({});
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

  // Helper function to check if a field has an error
  const hasError = (fieldName: string) => {
    return fieldName in validationErrors;
  };
  
  // Helper function to get the error message for a field
  const getErrorMessage = (fieldName: string) => {
    return validationErrors[fieldName]?.[0] || "";
  };

  // Clear image preview - ensure we properly handle base64 and storage URLs
  const clearImagePreview = (index: number) => {
    const newAchievements = [...achievements];
    
    // Revoke the object URL to prevent memory leaks
    if (newAchievements[index].imagePreview && newAchievements[index].imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(newAchievements[index].imagePreview);
    }
    
    newAchievements[index].imagePreview = null;
    
    // If the image was a new upload (base64) or an existing URL, clear it
    // The API will handle deleting the file from storage if needed
    newAchievements[index].imageSrc = '';
    
    setAchievements(newAchievements);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any object URLs to prevent memory leaks
      achievements.forEach(achievement => {
        if (achievement.imagePreview && achievement.imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(achievement.imagePreview);
        }
      });
    };
  }, [achievements]);

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
        <CardContent>
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Currently Published Content</h3>
            <p>Page Title: <span className="font-mono">{pageContent.title || "(empty)"}</span></p>
            <p>Description: <span className="font-mono">{pageContent.description ? `${pageContent.description.substring(0, 50)}${pageContent.description.length > 50 ? '...' : ''}` : "(empty)"}</span></p>
            <p>Achievements: {achievements.length} items displayed</p>
            <p>Images: {achievements.filter(a => a.imageSrc).length} of {achievements.length} achievements have images</p>
          </div>
        </CardContent>
      </Card>

      {/* Page Header Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Page Header</CardTitle>
          <CardDescription>Edit the main title and description for the awards page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center">
              Page Title <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={pageContent.title}
              onChange={handlePageContentChange}
              placeholder="Enter the main page title"
              className={hasError("pageTitle") ? "border-red-500" : ""}
            />
            {hasError("pageTitle") && (
              <p className="text-xs text-red-500">{getErrorMessage("pageTitle")}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center">
              Page Description <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={pageContent.description}
              onChange={handlePageContentChange}
              placeholder="Enter a description for the awards page"
              rows={4}
              className={hasError("pageDescription") ? "border-red-500" : ""}
            />
            {hasError("pageDescription") && (
              <p className="text-xs text-red-500">{getErrorMessage("pageDescription")}</p>
            )}
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
                    <div className="flex items-center gap-1">
                      {/* Add up/down arrows for reordering */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-500"
                        onClick={() => moveAchievementUp(index)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-500"
                        onClick={() => moveAchievementDown(index)}
                        disabled={index === achievements.length - 1}
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeAchievement(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`achievement_title_${index}`} className="flex items-center">
                          Achievement Title <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id={`achievement_title_${index}`}
                          value={achievement.title}
                          onChange={(e) => handleAchievementChange(index, 'title', e.target.value)}
                          placeholder="Enter achievement title"
                          className={hasError(`achievement_${index}_title`) ? "border-red-500" : ""}
                        />
                        {hasError(`achievement_${index}_title`) && (
                          <p className="text-xs text-red-500">{getErrorMessage(`achievement_${index}_title`)}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`achievement_alt_${index}`} className="flex items-center">
                          Image Alt Text <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id={`achievement_alt_${index}`}
                          value={achievement.imageAlt || ""}
                          onChange={(e) => handleAchievementChange(index, 'imageAlt', e.target.value)}
                          placeholder="Describe the image for accessibility"
                          className={hasError(`achievement_${index}_imageAlt`) ? "border-red-500" : ""}
                        />
                        {hasError(`achievement_${index}_imageAlt`) && (
                          <p className="text-xs text-red-500">{getErrorMessage(`achievement_${index}_imageAlt`)}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Briefly describe the image for accessibility purposes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Label className="flex items-center">
                        Achievement Image <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <div className={`relative aspect-video w-full overflow-hidden rounded-lg border ${hasError(`achievement_${index}_imageSrc`) ? "border-red-500" : "border-dashed"}`}>
                        {(achievement.imagePreview || achievement.imageSrc) ? (
                          <Image 
                            src={achievement.imagePreview || achievement.imageSrc}
                            alt={achievement.imageAlt}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted">
                            <ImageIcon className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {hasError(`achievement_${index}_imageSrc`) && (
                        <p className="text-xs text-red-500">{getErrorMessage(`achievement_${index}_imageSrc`)}</p>
                      )}
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
      <div className="flex flex-col gap-2 mt-6">
        <div className="self-start mb-2">
          <p className="text-sm text-muted-foreground italic">
            <span className="text-red-500">*</span> Required fields
          </p>
        </div>
        <div className="flex justify-end gap-4">
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
    </div>
  );
}