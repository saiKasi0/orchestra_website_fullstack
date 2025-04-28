"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Trash2, Upload, Plus, ImageIcon, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Achievement, AwardsContent } from "@/types/awards";
import { v4 as uuidv4 } from "uuid";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

type ExtendedAchievement = Omit<Achievement, 'id'> & {
  id?: number;
  keyId: string;
  imagePreview: string | null;
};

// Achievement Item Component
const AchievementItem = ({
  achievement,
  index,
  onDelete,
  onChange,
  onImageUpload,
  onClearImage,
  onMoveUp,
  onMoveDown,
  hasError,
  getErrorMessage,
  isFirst,
  isLast
}: {
  achievement: ExtendedAchievement;
  index: number;
  onDelete: () => void;
  onChange: (field: 'title' | 'imageAlt', value: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  hasError: (fieldName: string) => boolean;
  getErrorMessage: (fieldName: string) => string;
  isFirst: boolean;
  isLast: boolean;
}) => {
  return (
    <div className="relative mb-6">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-base font-medium">Achievement {index + 1}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500"
              onClick={onMoveUp}
              disabled={isFirst}
              title="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500"
              onClick={onMoveDown}
              disabled={isLast}
              title="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={onDelete}
              title="Delete achievement"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: Title and Alt Text */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`achievement_title_${index}`} className="flex items-center">
                  Achievement Title <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id={`achievement_title_${index}`}
                  value={achievement.title}
                  onChange={(e) => onChange('title', e.target.value)}
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
                  onChange={(e) => onChange('imageAlt', e.target.value)}
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

            {/* Right Column: Image Upload and Preview */}
            <div className="space-y-4">
              <Label className="flex items-center">
                Achievement Image <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className={`relative aspect-video w-full overflow-hidden rounded-lg border ${hasError(`achievement_${index}_imageSrc`) ? "border-red-500" : "border-dashed"}`}>
                {(achievement.imagePreview || (achievement.imageSrc && !achievement.imageSrc.startsWith('data:image/'))) ? (
                  <Image
                    src={achievement.imagePreview || achievement.imageSrc}
                    alt={achievement.imageAlt || `Achievement ${index + 1} image`}
                    fill
                    className="object-contain"
                    unoptimized={!!achievement.imagePreview || achievement.imageSrc?.startsWith('data:image/')}
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
                    {achievement.imageSrc || achievement.imagePreview ? 'Change' : 'Choose'} Image
                  </label>
                </Button>
                <Input
                  id={`image_upload_${index}`}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={onImageUpload}
                />
                {(achievement.imagePreview || achievement.imageSrc) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearImage}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
              {achievement.imageSrc && !achievement.imageSrc.startsWith('data:image/') && (
                <p className="text-xs text-muted-foreground truncate">
                  Current image: {achievement.imageSrc.split('/').pop()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

          // Map achievements: store numeric id, generate keyId
          const fetchedAchievements = (data.content.achievements || [])
            .sort((a: Achievement, b: Achievement) => (a.order_number || 0) - (b.order_number || 0))
            .map((item: Achievement): ExtendedAchievement => ({
              id: item.id, // Store the numeric ID from the API
              keyId: item.id ? `db-${item.id}` : `temp-${uuidv4()}`, // Generate a stable key
              title: item.title || "",
              imageSrc: item.imageSrc || "",
              imageAlt: item.imageAlt || "",
              imagePreview: null,
              order_number: item.order_number // Use order_number from DB
            }));

          setAchievements(fetchedAchievements);
        } else {
                    console.log("No existing awards content found, starting fresh.");
          setAchievements([]);
          setPageContent({ title: "", description: "" });
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
        if (validationErrors[name === 'title' ? 'pageTitle' : 'pageDescription']) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name === 'title' ? 'pageTitle' : 'pageDescription'];
        return newErrors;
      });
    }
  };

  // Handle achievement changes - ensure values are never undefined
  const handleAchievementChange = (
    index: number,
    field: 'title' | 'imageAlt',
    value: string
  ) => {
    const newAchievements = [...achievements];
    newAchievements[index][field] = value || "";
    setAchievements(newAchievements);
        const errorKey = `achievement_${index}_${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  // Handle image upload - Use base64 for preview
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should not exceed 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newAchievements = [...achievements];

        newAchievements[index].imagePreview = base64String;
        newAchievements[index].imageSrc = base64String;

        setAchievements(newAchievements);

                const errorKey = `achievement_${index}_imageSrc`;
        if (validationErrors[errorKey]) {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[errorKey];
            return newErrors;
          });
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        toast.error("Failed to process image");
      };

      reader.readAsDataURL(file);
    }
  };

  // Add a new achievement
  const addAchievement = () => {
    const newKeyId = `temp-${uuidv4()}`;
    setAchievements([
      ...achievements,
      {
        id: undefined,
        keyId: newKeyId,
        title: "",
        imageSrc: "",
        imageAlt: "",
        imagePreview: null,
        order_number: achievements.length + 1
      }
    ]);
    toast.info("New achievement added. Fill in the details and save.");
  };

  // Remove an achievement
  const removeAchievement = (index: number) => {
    const newAchievements = achievements.filter((_, i) => i !== index);

    // Update order numbers based on new index
    const reorderedAchievements = newAchievements.map((achievement, i) => ({
      ...achievement,
      order_number: i + 1
    }));

    setAchievements(reorderedAchievements);
    toast.info("Achievement removed. Remember to save changes.");
  };

  // Move achievement up in the order (using buttons)
  const moveAchievementUp = (index: number) => {
    if (index === 0) return; // Already at the top

    const newAchievements = [...achievements];
    const temp = newAchievements[index];
    newAchievements[index] = newAchievements[index - 1];
    newAchievements[index - 1] = temp;

    // Update order numbers based on new index
    const reorderedAchievements = newAchievements.map((achievement, i) => ({
      ...achievement,
      order_number: i + 1
    }));

    setAchievements(reorderedAchievements);
  };

  const moveAchievementDown = (index: number) => {
    if (index === achievements.length - 1) return; // Already at the bottom

    const newAchievements = [...achievements];
    const temp = newAchievements[index];
    newAchievements[index] = newAchievements[index + 1];
    newAchievements[index + 1] = temp;

    // Update order numbers based on new index
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

      if (!achievement.imageSrc && !achievement.imagePreview) {
        errors[`achievement_${index}_imageSrc`] = ["An image is required"];
      } else if (!achievement.imageSrc && achievement.imagePreview) {
        errors[`achievement_${index}_imageSrc`] = ["Image selected but not processed. Please re-select."];
      } else if (achievement.imageSrc && !achievement.imageSrc.startsWith('data:image/') && !achievement.imageSrc.startsWith('http')) {
        errors[`achievement_${index}_imageSrc`] = ["Invalid image source."];
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
      // Prepare the data payload: OMIT achievement ID
      const payload = {
        content: {
          id: contentId,
          title: pageContent.title,
          description: pageContent.description,
          // Map achievements for the payload, excluding 'id' and 'keyId'
          achievements: achievements.map((achievement, index) => ({
            // id: achievement.id, // DO NOT SEND ID - DB generates/handles it via delete/insert
            title: achievement.title,
            imageSrc: achievement.imageSrc,
            imageAlt: achievement.imageAlt,
            order_number: index + 1 // Send the final order number based on current array order
          }))
        }
      };

      const response = await fetch('/api/admin/content/awards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error("API Save Error:", response.status);
        // console.error("API Save Error:", errorddData);
        toast.error(`Save failed: ${response.status || `HTTP error! Status: ${response.status}`}`);
        setIsSaving(false);
        return;
      }

      const result = await response.json();

      if (result.contentId && !contentId) {
        setContentId(result.contentId);
      }

      toast.success("Content saved successfully");

      // Update state with results from API (including new numeric IDs)
      if (result.updatedAchievements) {
        const updatedAchievementsWithKeys = result.updatedAchievements
          // Fix sort syntax and ensure numbers are handled
          .sort((a: Achievement, b: Achievement) => (a.order_number ?? 0) - (b.order_number ?? 0)) 
          .map((apiAchievement: Achievement): ExtendedAchievement => ({
            ...apiAchievement, // Includes numeric id and order_number from DB
            keyId: apiAchievement.id ? `db-${apiAchievement.id}` : `temp-${uuidv4()}`, // Generate key based on new ID
            imagePreview: null
          }));
        setAchievements(updatedAchievementsWithKeys);
      } else {
        // Fallback: Clear previews if API didn't return updated list
        const clearedPreviews = achievements.map(achievement => ({
          ...achievement,
          imagePreview: null
        }));
        setAchievements(clearedPreviews);
      }

    } catch (error) {
      console.error("Error saving content:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save content due to an unexpected error.");
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

  // Clear image preview and source
  const clearImagePreview = (index: number) => {
    const newAchievements = [...achievements];
    const achievement = newAchievements[index];

    achievement.imagePreview = null;
    achievement.imageSrc = '';

    setAchievements(newAchievements);

    const errorKey = `achievement_${index}_imageSrc`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
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
              <BreadcrumbLink href="/admin/content/awards">Awards</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Awards Content Management</CardTitle>
          <CardDescription>
            Update the awards and achievements displayed on your website. Use arrows to reorder items. Changes require saving.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Current Content Status</h3>
            <p>Page Title: <span className="font-mono">{pageContent.title || "(empty)"}</span></p>
            <p>Description: <span className="font-mono">{pageContent.description ? `${pageContent.description.substring(0, 50)}${pageContent.description.length > 50 ? '...' : ''}` : "(empty)"}</span></p>
            <p>Achievements: {achievements.length} items configured</p>
            <p>Images: {achievements.filter(a => a.imageSrc || a.imagePreview).length} of {achievements.length} achievements have images</p>
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
            <CardDescription>Manage the achievement cards. Use arrows to reorder.</CardDescription>
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
            <div>
              {achievements.map((achievement, index) => (
                <AchievementItem
                  key={achievement.keyId} 
                  achievement={achievement}
                  index={index}
                  onDelete={() => removeAchievement(index)}
                  onChange={(field, value) => handleAchievementChange(index, field, value)}
                  onImageUpload={(e) => handleImageUpload(index, e)}
                  onClearImage={() => clearImagePreview(index)}
                  onMoveUp={() => moveAchievementUp(index)}
                  onMoveDown={() => moveAchievementDown(index)}
                  hasError={hasError}
                  getErrorMessage={getErrorMessage}
                  isFirst={index === 0}
                  isLast={index === achievements.length - 1}
                />
              ))}
            </div>
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
          <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
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