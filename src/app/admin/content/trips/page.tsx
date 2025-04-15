"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileMusicIcon as MusicNote, MapPin, Users, Upload, Trash2, Loader2, ImageIcon, GripVertical } from "lucide-react";
import { toast } from "sonner";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TripsContent, GalleryImage, FeatureItem } from "@/types/trips";

// Sortable gallery item component
const SortableGalleryItem = ({ id, src, index, onDelete }: { id: string; src: string; index: number; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Delete button positioned absolutely on top right, outside of drag handle area */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-2 -right-2 h-7 w-7 rounded-full z-10 shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete();
        }}
        type="button"
      >
        <Trash2 className="h-3 w-3" />
        <span className="sr-only">Delete image</span>
      </Button>

      <div
        className="border rounded-lg overflow-hidden cursor-move bg-white"
        {...attributes}
        {...listeners}
      >
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={src}
            alt={`Gallery image ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-2 flex items-center bg-white border-t">
          <div className="flex items-center">
            <GripVertical className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm">Image {index + 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TripsContentManagement() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [content, setContent] = useState({
    pageTitle: "",
    pageSubtitle: "",
    quote: ""
  });

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [contentId, setContentId] = useState<number | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [featureItems, setFeatureItems] = useState<FeatureItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/content/trips');

        if (!response.ok) {
          throw new Error(`Failed to fetch trips content: ${response.statusText}`);
        }

        const data = await response.json();
        const fetchedContent: TripsContent | null = data.content;

        if (fetchedContent && fetchedContent.id) {
          setContentId(fetchedContent.id);

          setContent({
            pageTitle: fetchedContent.page_title || "",
            pageSubtitle: fetchedContent.page_subtitle || "",
            quote: fetchedContent.quote || ""
          });

          setGalleryImages(fetchedContent.gallery_images || []);
          setFeatureItems(fetchedContent.feature_items || []);
        } else {
          setContentId(1);
          setContent({ pageTitle: "", pageSubtitle: "", quote: "" });
          setGalleryImages([]);
          setFeatureItems([]);
        }
      } catch (error) {
        console.error("Error fetching trips content:", error);
        toast.error("Failed to load trips content. Please try again.");
        setContentId(1);
        setContent({ pageTitle: "", pageSubtitle: "", quote: "" });
        setGalleryImages([]);
        setFeatureItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageToGallery = () => {
    if (newImagePreview) {
      const newId = `temp-${Date.now()}`;
      setGalleryImages([...galleryImages, {
        id: newId,
        src: newImagePreview
      }]);
      setNewImagePreview(null);

      const fileInput = document.getElementById('new-gallery-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast.info("Image added to the list. Remember to save changes.");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    const activeId = active.id as string;
    const overId = over?.id as string | undefined;

    if (overId && activeId !== overId) {
      setGalleryImages((items) => {
        const oldIndex = items.findIndex((item) => String(item.id) === activeId);
        const newIndex = items.findIndex((item) => String(item.id) === overId);

        if (oldIndex === -1 || newIndex === -1) return items;

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const removeImage = (idToRemove: number | string) => {
    console.log(`Removing image with ID: ${idToRemove}, type: ${typeof idToRemove}`);
    
    // Debug current images
    console.log("Current images:", galleryImages.map(img => ({ id: img.id, type: typeof img.id })));
    
    // Convert ID to string for consistent comparison
    const idToRemoveStr = String(idToRemove);
    
    setGalleryImages(prevImages => {
      const newImages = prevImages.filter(img => String(img.id) !== idToRemoveStr);
      console.log(`Filtered from ${prevImages.length} to ${newImages.length} images`);
      return newImages;
    });
    
    toast.info("Image removed. Remember to save changes.");
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureItemChange = (index: number, field: keyof FeatureItem, value: string) => {
    const newFeatureItems = [...featureItems];
    if (newFeatureItems[index]) {
      newFeatureItems[index] = { ...newFeatureItems[index], [field]: value };
      setFeatureItems(newFeatureItems);
    }
  };

  const handleIconChange = (index: number, iconName: string) => {
    const newFeatureItems = [...featureItems];
    if (newFeatureItems[index]) {
      newFeatureItems[index] = { ...newFeatureItems[index], icon: iconName as FeatureItem['icon'] };
      setFeatureItems(newFeatureItems);
    }
  };

  const addFeatureItem = () => {
    setFeatureItems([
      ...featureItems,
      {
        id: `temp-feature-${Date.now()}`,
        icon: "MusicNote",
        title: "New Feature Title",
        description: "Enter feature description here."
      }
    ]);
    toast.info("New feature item added. Edit its content and save changes.");
  };

  const removeFeatureItem = (idToRemove: number | string) => {
    setFeatureItems(featureItems.filter(item => item.id !== idToRemove));
    toast.info("Feature item removed. Remember to save changes.");
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const formData = {
        id: 1,
        page_title: content.pageTitle,
        page_subtitle: content.pageSubtitle,
        quote: content.quote,
        gallery_images: galleryImages.map((img, index) => ({
          src: img.src,
          order_number: index
        })),
        feature_items: featureItems.map((item, index) => ({
          icon: item.icon as FeatureItem['icon'],
          title: item.title,
          description: item.description,
          order_number: index
        }))
      };

      const response = await fetch('/api/admin/content/trips', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save trips content');
      }

      const data = await response.json();

      setContentId(data.contentId);

      const refetchResponse = await fetch('/api/admin/content/trips');
      if (refetchResponse.ok) {
        const refetchedData = await refetchResponse.json();
        if (refetchedData.content) {
          setGalleryImages(refetchedData.content.gallery_images || []);
          setFeatureItems(refetchedData.content.feature_items || []);
        }
      } else {
        console.error("Failed to refetch content after saving.");
        toast.warning("Content saved, but failed to refresh updated image URLs/IDs. Please reload the page.");
      }

      toast.success("Trips content has been saved successfully.");
    } catch (error) {
      console.error('Error saving trips content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save trips content');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading content...</span>
      </div>
    );
  }

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
            <BreadcrumbLink href="/admin/content/trips">Trips & Socials</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trips & Socials Content Management</CardTitle>
          <CardDescription>
            Update the content of the Trips & Socials page. Changes will be reflected on the live site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Currently Published Content (ID: {contentId ?? 'N/A'})</h3>
            <p>Page Title: <span className="font-mono">{content.pageTitle || "(empty)"}</span></p>
            <p>Subtitle: <span className="font-mono">{content.pageSubtitle || "(empty)"}</span></p>
            <p>Quote: <span className="font-mono">{content.quote ? `${content.quote.substring(0, 50)}${content.quote.length > 50 ? '...' : ''}` : "(empty)"}</span></p>
            <p>Gallery Images: {galleryImages.length} images displayed</p>
            <p>Feature Items: {featureItems.length} feature items displayed</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="page" className="w-full">
        <TabsList className="mb-4 grid grid-cols-3 gap-4">
          <TabsTrigger value="page">Page Content</TabsTrigger>
          <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
          <TabsTrigger value="features">Feature Items</TabsTrigger>
        </TabsList>

        <TabsContent value="page" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Content</CardTitle>
              <CardDescription>Edit the main content of the page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pageTitle">Page Title</Label>
                  <Input
                    id="pageTitle"
                    name="pageTitle"
                    value={content.pageTitle}
                    onChange={handleContentChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pageSubtitle">Page Subtitle</Label>
                  <Input
                    id="pageSubtitle"
                    name="pageSubtitle"
                    value={content.pageSubtitle}
                    onChange={handleContentChange}
                  />
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <Label htmlFor="quote">Bottom Quote</Label>
                  <Textarea
                    id="quote"
                    name="quote"
                    value={content.quote}
                    onChange={handleContentChange}
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Image Gallery</CardTitle>
              <CardDescription>Manage the images displayed in the gallery. Drag to reorder.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Current Gallery Images</Label>

                {galleryImages.length > 0 ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={galleryImages.map(img => String(img.id))}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {galleryImages.map((image, index) => (
                          <SortableGalleryItem
                            key={String(image.id)}
                            id={String(image.id)}
                            src={image.src}
                            index={index}
                            onDelete={() => removeImage(image.id!)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="py-10 text-center border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No images in the gallery yet. Add your first image below.</p>
                  </div>
                )}

                <Separator className="my-6" />

                <div className="space-y-4">
                  <Label>Add New Image</Label>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-dashed">
                        {newImagePreview ? (
                          <Image
                            src={newImagePreview}
                            alt="New image preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                          <label htmlFor="new-gallery-image">
                            <Upload className="h-4 w-4" />
                            Choose Image
                          </label>
                        </Button>
                        <Input
                          id="new-gallery-image"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageUpload}
                        />
                        {newImagePreview && (
                          <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setNewImagePreview(null)}>
                            <Trash2 className="h-4 w-4" />
                            Remove Preview
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Upload a new image to add to the gallery. Recommended aspect ratio is 16:9. Maximum file size is 5MB. The image will be uploaded when you save changes.
                        </p>
                        <Button
                          onClick={addImageToGallery}
                          disabled={!newImagePreview}
                          className="w-full sm:w-auto"
                        >
                          Add Image to List
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Items</CardTitle>
              <CardDescription>Edit the feature items displayed on the page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {featureItems.length === 0 && (
                <div className="py-10 text-center border border-dashed rounded-lg">
                  <p className="text-muted-foreground">No feature items yet. Add your first item below.</p>
                </div>
              )}

              {featureItems.map((feature, index) => (
                <div key={String(feature.id)} className="space-y-4 p-4 border rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-destructive"
                    onClick={() => removeFeatureItem(feature.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove Feature {index + 1}</span>
                  </Button>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Feature {index + 1}</h3>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`feature_icon_${index}`}>Icon</Label>
                      <Select
                        value={feature.icon}
                        onValueChange={(value) => handleIconChange(index, value)}
                      >
                        <SelectTrigger id={`feature_icon_${index}`}>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MusicNote">Music Note</SelectItem>
                          <SelectItem value="MapPin">Map Pin</SelectItem>
                          <SelectItem value="Users">Users</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-2 p-4 flex justify-center">
                        {feature.icon === "MusicNote" && <MusicNote className="w-8 h-8 text-amber-500" />}
                        {feature.icon === "MapPin" && <MapPin className="w-8 h-8 text-amber-500" />}
                        {feature.icon === "Users" && <Users className="w-8 h-8 text-amber-500" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`feature_title_${index}`}>Title</Label>
                      <Input
                        id={`feature_title_${index}`}
                        value={feature.title}
                        onChange={(e) => handleFeatureItemChange(index, 'title', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label htmlFor={`feature_description_${index}`}>Description</Label>
                      <Textarea
                        id={`feature_description_${index}`}
                        value={feature.description}
                        onChange={(e) => handleFeatureItemChange(index, 'description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-center mt-6">
                <Button variant="outline" onClick={addFeatureItem}>
                  Add New Feature Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8 space-x-4">
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