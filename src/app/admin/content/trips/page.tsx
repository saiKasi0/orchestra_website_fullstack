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

// Sortable gallery item component
const SortableGalleryItem = ({ id, src, index, onDelete }: { id: string; src: string; index: number; onDelete: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
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
        <div className="p-2 flex justify-between items-center bg-white border-t">
          <div className="flex items-center">
            <GripVertical className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-sm">Image {index + 1}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function TripsContentManagement() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for page content
  const [content, setContent] = useState({
    pageTitle: "Orchestra Trips & Socials",
    pageSubtitle: "Explore our adventures and memorable moments",
    quote: "Thank you to everyone who makes these moments unforgettable. We're excited for the upcoming socials and journeys this year. Stay tuned for announcements on our next adventure!"
  });
  
  // State for gallery images
  const [galleryImages, setGalleryImages] = useState([
    { id: "img1", src: "/CypressRanchOrchestraInstagramPhotos/CocoSocial.jpg" },
    { id: "img2", src: "/CypressRanchOrchestraInstagramPhotos/HoustonSymphonyMargianos.jpg" },
    { id: "img3", src: "/CypressRanchOrchestraInstagramPhotos/HoustonSymphony.jpg" },
    { id: "img4", src: "/CypressRanchOrchestraInstagramPhotos/HoustonSymphonyTripArcade.jpg" },
    { id: "img5", src: "/CypressRanchOrchestraInstagramPhotos/Disney2023.jpg" },
  ]);
  
  // Content ID from the database (if it exists)
  const [contentId, setContentId] = useState<string | null>(null);
  
  // State for new image upload
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  
  // State for feature items
  const [featureItems, setFeatureItems] = useState([
    {
      id: "feature1",
      icon: "MusicNote",
      title: "More Than Just Music",
      description: "Being part of our orchestra is about creating beautiful music and forming lasting friendships. We believe that the bonds formed off-stage are just as important as the harmony we create on-stage."
    },
    {
      id: "feature2",
      icon: "MapPin",
      title: "Exciting Adventures",
      description: "From weekend retreats to city trips, each event is a chance to unwind, explore, and connect in new ways. We've explored museums, attended professional concerts, and even had fun at theme parks!"
    },
    {
      id: "feature3",
      icon: "Users",
      title: "Unforgettable Moments",
      description: "These experiences bring us together, whether it's sightseeing, enjoying group dinners, or simply having fun. The memories we create during these trips last a lifetime and strengthen our musical connection."
    }
  ]);
  
  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/content/trips');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch trips content: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.content) {
          setContentId(data.content.id || null);
          
          // Set page content
          setContent({
            pageTitle: data.content.page_title || "Orchestra Trips & Socials",
            pageSubtitle: data.content.page_subtitle || "Explore our adventures and memorable moments",
            quote: data.content.quote || ""
          });
          
          // Set gallery images
          if (data.content.gallery_images && Array.isArray(data.content.gallery_images)) {
            interface ApiGalleryImage {
              id: string;
              src: string;
            }
            
            setGalleryImages(data.content.gallery_images.map((img: ApiGalleryImage) => ({
              id: img.id,
              src: img.src
            })));
          }
          
          // Set feature items
          if (data.content.feature_items && Array.isArray(data.content.feature_items)) {
            interface ApiFeatureItem {
              id: string;
              icon: string;
              title: string;
              description: string;
            }
            
            setFeatureItems(data.content.feature_items.map((item: ApiFeatureItem) => ({
              id: item.id,
              icon: item.icon,
              title: item.title,
              description: item.description
            })));
          }
        }
      } catch (error) {
        console.error("Error fetching trips content:", error);
        toast.error("Failed to load trips content. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // DnD sensors setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the image
      const url = URL.createObjectURL(file);
      setNewImagePreview(url);
      
      // TODO: In a full implementation, we would upload the image to storage
      // and get the actual URL back from the server
    }
  };
  
  // Add the image to gallery
  const addImageToGallery = () => {
    if (newImagePreview) {
      const newId = `img${Date.now()}`;
      setGalleryImages([...galleryImages, {
        id: newId,
        src: newImagePreview
      }]);
      setNewImagePreview(null);
    }
  };
  
  // Handle image reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      setGalleryImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  // Remove image from gallery
  const removeImage = (id: string) => {
    setGalleryImages(galleryImages.filter(img => img.id !== id));
  };
  
  // Handle content text changes
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle feature item changes
  const handleFeatureItemChange = (index: number, field: string, value: string) => {
    const newFeatureItems = [...featureItems];
    // @ts-expect-error - We know these fields exist
    newFeatureItems[index][field] = value;
    setFeatureItems(newFeatureItems);
  };
  
  // Change feature icon
  const handleIconChange = (index: number, iconName: string) => {
    const newFeatureItems = [...featureItems];
    newFeatureItems[index].icon = iconName;
    setFeatureItems(newFeatureItems);
  };
  
  // Save function to update content
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Prepare the data for submission
      const formData = {
        id: contentId,
        page_title: content.pageTitle,
        page_subtitle: content.pageSubtitle,
        quote: content.quote,
        gallery_images: galleryImages.map((img, index) => ({
          id: img.id,
          src: img.src,
          order_number: index + 1
        })),
        feature_items: featureItems.map((item, index) => ({
          id: item.id,
          icon: item.icon,
          title: item.title,
          description: item.description,
          order_number: index + 1
        }))
      };
      
      // Submit the data
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
      
      // Update the content ID if we got one back
      if (data.contentId) {
        setContentId(data.contentId);
      }
      
      // Show success message
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
            Update the content of the Trips & Socials page. Changes will be reflected on the live site. This website is intended to be used on a desktop device. 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Currently Published Content</h3>
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
        
        {/* Page Content Tab */}
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
        
        {/* Image Gallery Tab */}
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
                      items={galleryImages.map(img => img.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {galleryImages.map((image, index) => (
                          <SortableGalleryItem
                            key={image.id}
                            id={image.id}
                            src={image.src}
                            index={index}
                            onDelete={() => removeImage(image.id)}
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
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Upload a new image to add to the gallery. Recommended aspect ratio is 16:9. Maximum file size is 5MB.
                        </p>
                        <Button 
                          onClick={addImageToGallery} 
                          disabled={!newImagePreview}
                          className="w-full sm:w-auto"
                        >
                          Add to Gallery
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Feature Items Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Items</CardTitle>
              <CardDescription>Edit the feature items displayed on the page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {featureItems.map((feature, index) => (
                <div key={feature.id} className="space-y-4">
                  <div className="flex justify-between items-center">
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
                  
                  {index < featureItems.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
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