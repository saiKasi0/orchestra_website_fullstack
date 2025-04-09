"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Trash2, 
  PlusCircle, 
  Loader2, 
  ImagePlus,
  } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { CompetitionsContent, CompetitionSchema } from "@/types/competitions";

export default function CompetitionContentManagement() {
  // State for managing form data
  const [content, setContent] = useState<CompetitionsContent>({
    title: "Competitions",
    description: "Our orchestra participates in numerous prestigious competitions throughout the year. We have achieved significant recognition at both regional and national levels.",
    competitions: [
      {
        id: "1",
        name: "National Orchestra Competition",
        image: "/placeholder-competition.jpg",
        description: "One of the most prestigious competitions in the country for high school orchestras.",
        categories: ["String Orchestra", "Full Orchestra"],
        additionalInfo: "Participation is by invitation only. Our orchestra has been invited for the past 5 consecutive years."
      },
      {
        id: "2",
        name: "State Music Festival",
        image: "/placeholder-festival.jpg",
        description: "Annual state-wide music festival featuring the best orchestras from across the state.",
        categories: ["Symphony Orchestra", "Chamber Orchestra"],
        additionalInfo: "This festival includes workshops with renowned conductors and masterclasses with professional musicians."
      }
    ]
  });

  // State for tracking the currently active competition for editing
  const [activeCompetition, setActiveCompetition] = useState("1");
  
  // State for tracking form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler for content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for competition changes
  const handleCompetitionChange = (competitionId: string, field: keyof CompetitionSchema, value: string) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.map(comp => {
        if (comp.id === competitionId) {
          return { ...comp, [field]: value };
        }
        return comp;
      })
    }));
  };

  // Handler for adding a new competition
  const addCompetition = () => {
    const newId = String(Math.max(...content.competitions.map(c => Number(c.id))) + 1);
    const newCompetition: CompetitionSchema = {
      id: newId,
      name: "New Competition",
      image: "/placeholder-competition.jpg",
      description: "Description of the new competition",
      categories: [],
      additionalInfo: ""
    };
    
    setContent(prev => ({
      ...prev,
      competitions: [...prev.competitions, newCompetition]
    }));
    
    setActiveCompetition(newId);
  };

  // Handler for removing a competition
  const removeCompetition = (id: string) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.filter(comp => comp.id !== id)
    }));
    
    // If we're removing the active competition, select another one
    if (activeCompetition === id) {
      const remaining = content.competitions.filter(comp => comp.id !== id);
      if (remaining.length > 0) {
        setActiveCompetition(remaining[0].id);
      }
    }
  };

  // Handler for category changes
  const handleCategoryChange = (competitionId: string, index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.map(comp => {
        if (comp.id === competitionId) {
          const updatedCategories = [...comp.categories];
          updatedCategories[index] = value;
          return { ...comp, categories: updatedCategories };
        }
        return comp;
      })
    }));
  };

  // Handler for adding a new category
  const addCategory = (competitionId: string) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.map(comp => {
        if (comp.id === competitionId) {
          return {
            ...comp,
            categories: [...comp.categories, ""]
          };
        }
        return comp;
      })
    }));
  };

  // Handler for removing a category
  const removeCategory = (competitionId: string, index: number) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.map(comp => {
        if (comp.id === competitionId) {
          const updatedCategories = [...comp.categories];
          updatedCategories.splice(index, 1);
          return { ...comp, categories: updatedCategories };
        }
        return comp;
      })
    }));
  };

  // Handler for image upload
  const handleImageUpload = (competitionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement actual image upload logic with backend integration
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected for upload:", file.name);
      // For now, just simulate setting a new image
      const imageUrl = URL.createObjectURL(file);
      handleCompetitionChange(competitionId, 'image', imageUrl);
    }
  };

  // Handler for form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/admin/content/competitions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }
      
      alert("Content saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
      alert(`Error saving content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col">
      <div className="container mx-auto flex max-w-6xl flex-col px-4 py-8">
        
        {/* Breadcrumb Navigation */}
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

        {/* Page Header */}
        <Card className="mb-6">
        <CardHeader>
            <CardTitle>Competition Management</CardTitle>
            <CardDescription>
            Update the content of your website&apos;s competitions page. The changes will be reflected on the live site. This website is intended to be used on a desktop device. </CardDescription>
        </CardHeader>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="competitions">Competitions</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Page Settings</CardTitle>
                <CardDescription>
                  Configure the general settings for the competitions page.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="pageTitle">Page Title</Label>
                    <Input 
                      id="pageTitle" 
                      name="title"
                      value={content.title}
                      onChange={handleContentChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="pageDescription">Page Description</Label>
                    <Textarea 
                      id="pageDescription" 
                      name="description"
                      value={content.description}
                      onChange={handleContentChange}
                      rows={4}
                    />
                    <p className="mt-2 text-sm text-muted-foreground">
                      This description appears at the top of the competitions page.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitions Tab */}
          <TabsContent value="competitions">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {/* Competitions List Sidebar */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Competitions</CardTitle>
                  <CardDescription>
                    Select a competition to edit or add a new one.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {content.competitions.map(comp => (
                        <div key={comp.id} className="flex items-center justify-between">
                          <Button 
                            variant={activeCompetition === comp.id ? "default" : "ghost"} 
                            className="w-full justify-start text-left"
                            onClick={() => setActiveCompetition(comp.id)}
                          >
                            {comp.name}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeCompetition(comp.id)}
                          >
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={addCompetition}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Competition
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Competition Editor */}
              <Card className="md:col-span-3">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Edit Competition</CardTitle>
                    <CardDescription>
                      Update the details for the selected competition.
                    </CardDescription>
                  </div>
                  {content.competitions.find(c => c.id === activeCompetition) && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-destructive"
                      onClick={() => removeCompetition(activeCompetition)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {content.competitions.find(c => c.id === activeCompetition) ? (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>
                        
                        <div>
                          <Label htmlFor="competitionName">Competition Name</Label>
                          <Input 
                            id="competitionName" 
                            value={content.competitions.find(c => c.id === activeCompetition)?.name || ""}
                            onChange={(e) => handleCompetitionChange(activeCompetition, 'name', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="competitionDescription">Description</Label>
                          <Textarea 
                            id="competitionDescription" 
                            value={content.competitions.find(c => c.id === activeCompetition)?.description || ""}
                            onChange={(e) => handleCompetitionChange(activeCompetition, 'description', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Competition Image */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Competition Image</h3>
                        
                        <div className="flex flex-col space-y-4">
                          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
                            <Image 
                              src={content.competitions.find(c => c.id === activeCompetition)?.image || "/placeholder-competition.jpg"}
                              alt={content.competitions.find(c => c.id === activeCompetition)?.name || "Competition"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="competitionImage">Upload New Image</Label>
                            <div className="mt-2">
                              <label htmlFor="competitionImage" className="flex cursor-pointer items-center gap-2 rounded-md border bg-muted/50 px-4 py-2 hover:bg-muted">
                                <ImagePlus className="h-4 w-4" />
                                <span>Choose file</span>
                                <input
                                  id="competitionImage"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => handleImageUpload(activeCompetition, e)}
                                />
                              </label>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Recommended image size: 1200x675 pixels (16:9)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Categories */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Competition Categories</h3>
                        <div className="space-y-3">
                          {content.competitions.find(c => c.id === activeCompetition)?.categories.map((category, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={category}
                                onChange={(e) => handleCategoryChange(activeCompetition, index, e.target.value)}
                                placeholder="Category name"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-destructive"
                                onClick={() => removeCategory(activeCompetition, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => addCategory(activeCompetition)}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Category
                          </Button>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Additional Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Additional Information</h3>
                        <div>
                          <Label htmlFor="additionalInfo">Additional Details</Label>
                          <Textarea
                            id="additionalInfo"
                            value={content.competitions.find(c => c.id === activeCompetition)?.additionalInfo || ""}
                            onChange={(e) => handleCompetitionChange(activeCompetition, 'additionalInfo', e.target.value)}
                            rows={4}
                          />
                          <p className="mt-1 text-sm text-muted-foreground">
                            Include any extra information about the competition that visitors should know.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <p className="text-muted-foreground">Select a competition to edit or add a new one.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end space-x-4">
          <Button variant="outline" asChild>
            <a href="/admin/content">Cancel</a>
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}