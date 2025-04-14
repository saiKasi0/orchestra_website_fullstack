"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { 
  Trash2, 
  PlusCircle, 
  Loader2, 
  ImagePlus,
  ImageIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

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

// Helper function to get the unique identifier (DB id or clientId)
const getCompetitionIdentifier = (comp: CompetitionSchema): number | string => {
  return comp.id ?? comp.clientId ?? ''; // Prefer DB id, fallback to clientId
};

export default function CompetitionContentManagement() {
  // State for managing form data
  const [content, setContent] = useState<CompetitionsContent>({
    title: "",
    description: "",
    competitions: []
  });

  // State for tracking loading status
  const [isLoading, setIsLoading] = useState(true);

  // State for tracking the currently active competition identifier (DB id or clientId)
  const [activeCompetitionIdentifier, setActiveCompetitionIdentifier] = useState<number | string>("");

  // State for tracking form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for tracking errors
  const [error, setError] = useState<string | null>(null);

  // Fetch competition data on component mount
  useEffect(() => {
    async function fetchCompetitionsData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/content/competitions');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.content) {
          // Ensure fetched data conforms to CompetitionSchema (might lack clientId initially)
          const competitionsWithClientIds = data.content.competitions.map((comp: Omit<CompetitionSchema, 'clientId'> & { clientId?: string }) => ({
            ...comp,
            clientId: comp.clientId ?? `client-${uuidv4()}` // Assign clientId if missing
          }));

          setContent({ ...data.content, competitions: competitionsWithClientIds });

          // Set the first competition as active if any exist
          if (competitionsWithClientIds.length > 0) {
            setActiveCompetitionIdentifier(getCompetitionIdentifier(competitionsWithClientIds[0]));
          }
        } else {
          setContent({
            title: "Our Competitions",
            description: "Cypress Ranch Orchestra participates in various prestigious competitions.",
            competitions: []
          });
        }
      } catch (err) {
        console.error("Failed to fetch competition content:", err);
        setError("Failed to load competition content. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCompetitionsData();
  }, []);

  // Handler for content changes
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for competition changes - use identifier
  const handleCompetitionChange = (identifier: number | string, field: keyof CompetitionSchema, value: string) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.map(comp => {
        if (getCompetitionIdentifier(comp) === identifier) {
          // Ensure we don't try to modify 'id' or 'clientId' directly here
          if (field !== 'id' && field !== 'clientId') {
            return { ...comp, [field]: value };
          }
        }
        return comp;
      })
    }));
  };

  // Handler for adding a new competition
  const addCompetition = () => {
    const newClientId = `client-${uuidv4()}`; // Generate temporary client ID
    const newCompetition: CompetitionSchema = {
      clientId: newClientId, 
      name: "New Competition",
      image: "",
      description: "Description of the new competition",
      categories: [],
      additionalInfo: ""
    };
    
    setContent(prev => ({
      ...prev,
      competitions: [...prev.competitions, newCompetition]
    }));
    
    setActiveCompetitionIdentifier(newClientId); // Set active using client ID
  };

  // Handler for removing a competition - use identifier
  const removeCompetition = (identifier: number | string) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.filter(comp => getCompetitionIdentifier(comp) !== identifier) 
    }));
    
    // Update active competition if the removed one was active
    if (activeCompetitionIdentifier === identifier) {
      const remaining = content.competitions.filter(comp => getCompetitionIdentifier(comp) !== identifier); 
      if (remaining.length > 0) {
        setActiveCompetitionIdentifier(getCompetitionIdentifier(remaining[0])); 
      } else {
        setActiveCompetitionIdentifier(""); 
      }
    }
  };

  // Handler for category changes - use identifier
  const handleCategoryChange = (identifier: number | string, index: number, value: string) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.map(comp => {
        if (getCompetitionIdentifier(comp) === identifier) {
          const updatedCategories = [...comp.categories];
          updatedCategories[index] = value;
          return { ...comp, categories: updatedCategories };
        }
        return comp;
      })
    }));
  };

  // Handler for adding a new category - use identifier
  const addCategory = (identifier: number | string) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.map(comp => {
        if (getCompetitionIdentifier(comp) === identifier) {
          return {
            ...comp,
            categories: [...comp.categories, ""]
          };
        }
        return comp;
      })
    }));
  };

  // Handler for removing a category - use identifier
  const removeCategory = (identifier: number | string, index: number) => {
    setContent(prev => ({
      ...prev,
      competitions: prev.competitions.map(comp => {
        if (getCompetitionIdentifier(comp) === identifier) {
          const updatedCategories = [...comp.categories];
          updatedCategories.splice(index, 1);
          return { ...comp, categories: updatedCategories };
        }
        return comp;
      })
    }));
  };

  // Handler for image upload - use identifier
  const handleImageUpload = (identifier: number | string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          handleCompetitionChange(identifier, 'image', reader.result); 
        } else {
          toast.error("Failed to read image file.");
          console.error("FileReader result is not a string:", reader.result);
        }
      };
      reader.onerror = (error) => {
        toast.error("Error reading image file.");
        console.error("FileReader error:", error);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler for moving a competition up
  const moveCompetitionUp = useCallback((identifier: number | string) => {
    setContent(prev => {
      const index = prev.competitions.findIndex(comp => getCompetitionIdentifier(comp) === identifier);
      if (index > 0) {
        const newCompetitions = [...prev.competitions];
        // Simple swap
        [newCompetitions[index - 1], newCompetitions[index]] = [newCompetitions[index], newCompetitions[index - 1]];
        return { ...prev, competitions: newCompetitions };
      }
      return prev;
    });
  }, []);

  // Handler for moving a competition down
  const moveCompetitionDown = useCallback((identifier: number | string) => {
    setContent(prev => {
      const index = prev.competitions.findIndex(comp => getCompetitionIdentifier(comp) === identifier);
      if (index !== -1 && index < prev.competitions.length - 1) {
        const newCompetitions = [...prev.competitions];
        // Simple swap
        [newCompetitions[index + 1], newCompetitions[index]] = [newCompetitions[index], newCompetitions[index + 1]];
        return { ...prev, competitions: newCompetitions };
      }
      return prev;
    });
  }, []);

  // Handler for form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
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
        throw new Error(errorData.error || `Failed to save: ${response.statusText}`);
      }
      
      const updatedResponse = await fetch('/api/admin/content/competitions');
      const updatedData = await updatedResponse.json();
      if (updatedData.content) {
        const competitionsWithClientIds = updatedData.content.competitions.map((comp: Omit<CompetitionSchema, 'clientId'> & { clientId?: string }) => ({
          ...comp,
          clientId: comp.clientId ?? `client-${uuidv4()}`
        }));
        setContent({ ...updatedData.content, competitions: competitionsWithClientIds });
        const currentActiveComp = content.competitions.find(c => getCompetitionIdentifier(c) === activeCompetitionIdentifier);
        const updatedComp = currentActiveComp?.id 
          ? competitionsWithClientIds.find((c: { id: number | undefined; }) => c.id === currentActiveComp.id)
          : competitionsWithClientIds.find((c: { clientId: string | undefined; }) => c.clientId === currentActiveComp?.clientId);

        if (updatedComp) {
          setActiveCompetitionIdentifier(getCompetitionIdentifier(updatedComp));
        } else if (competitionsWithClientIds.length > 0) {
          setActiveCompetitionIdentifier(getCompetitionIdentifier(competitionsWithClientIds[0]));
        } else {
          setActiveCompetitionIdentifier("");
        }
      }
      
      toast.success("Competition content saved");
    } catch (error) {
      console.error("Error saving content:", error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      toast.error("Failed to save changes", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCompetition = useMemo(() => {
    return content.competitions.find(c => getCompetitionIdentifier(c) === activeCompetitionIdentifier);
  }, [content.competitions, activeCompetitionIdentifier]);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading competition content...</p>
      </div>
    );
  }

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
              Update the content of your website&apos;s competitions page. The changes will be reflected on the live site. This website is intended to be used on a desktop device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">Currently Published Content</h3>
              <p>Page Title: <span className="font-mono">{content.title || "(empty)"}</span></p>
              <p>Description: <span className="font-mono">{content.description ? `${content.description.substring(0, 50)}${content.description.length > 50 ? '...' : ''}` : "(empty)"}</span></p>
              <p>Competitions: {content.competitions?.length || 0} competitions listed</p>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                <p className="text-sm font-medium">Error: {error}</p>
              </div>
            )}
          </CardContent>
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
                    Select, reorder, or add competitions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      {content.competitions.map((comp, index) => {
                        const identifier = getCompetitionIdentifier(comp);
                        const isFirst = index === 0;
                        const isLast = index === content.competitions.length - 1;
                        
                        return (
                          <div key={identifier} className="flex items-center gap-1">
                            <Button 
                              variant={activeCompetitionIdentifier === identifier ? "secondary" : "ghost"}
                              className="flex-grow justify-start text-left h-9 px-2 truncate overflow-hidden whitespace-nowrap"
                              onClick={() => setActiveCompetitionIdentifier(identifier)}
                              title={comp.name}
                            >
                              {comp.name}
                            </Button>
                            <div className="flex flex-col">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                onClick={() => moveCompetitionUp(identifier)}
                                disabled={isFirst}
                                aria-label="Move competition up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-muted-foreground hover:text-foreground"
                                onClick={() => moveCompetitionDown(identifier)}
                                disabled={isLast}
                                aria-label="Move competition down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive flex-shrink-0"
                              onClick={() => removeCompetition(identifier)}
                              aria-label="Remove competition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
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
                  {activeCompetition && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-destructive"
                      onClick={() => removeCompetition(activeCompetitionIdentifier)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {activeCompetition ? (
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>
                        
                        <div>
                          <Label htmlFor="competitionName">Competition Name</Label>
                          <Input 
                            id="competitionName" 
                            value={activeCompetition.name || ""}
                            onChange={(e) => handleCompetitionChange(activeCompetitionIdentifier, 'name', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="competitionDescription">Description</Label>
                          <Textarea 
                            id="competitionDescription" 
                            value={activeCompetition.description || ""}
                            onChange={(e) => handleCompetitionChange(activeCompetitionIdentifier, 'description', e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* Competition Image */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Competition Image</h3>
                        
                        <div className="flex flex-col space-y-4">
                          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-dashed">
                            {activeCompetition.image ? (
                              <Image 
                                src={activeCompetition.image}
                                alt={activeCompetition.name || "Competition"}
                                fill
                                className="object-cover"
                                unoptimized={activeCompetition.image.startsWith('data:image')}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <ImageIcon className="h-16 w-16 text-muted-foreground opacity-50" />
                              </div>
                            )}
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
                                  onChange={(e) => handleImageUpload(activeCompetitionIdentifier, e)}
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
                          {activeCompetition.categories.map((category, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Input
                                value={category}
                                onChange={(e) => handleCategoryChange(activeCompetitionIdentifier, index, e.target.value)}
                                placeholder="Category name"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-destructive"
                                onClick={() => removeCategory(activeCompetitionIdentifier, index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => addCategory(activeCompetitionIdentifier)}
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
                            value={activeCompetition.additionalInfo || ""}
                            onChange={(e) => handleCompetitionChange(activeCompetitionIdentifier, 'additionalInfo', e.target.value)}
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