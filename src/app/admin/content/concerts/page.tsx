"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Save, Trash2, Loader2, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ConcertsContent } from "@/types/concerts";
import Image from "next/image";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";


interface Orchestra {
  id: string;
  name: string;
  songs: string[];
}

export default function ConcertContentManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contentId, setContentId] = useState<string>("");
  const [posterImagePreview, setPosterImagePreview] = useState<string | null>(null);
  
  // Concert name state
  const [concertName, setConcertName] = useState<string>("");
  
  // Add state for no concert order text
  const [noConcertText, setNoConcertText] = useState("");
  
  // Poster image state
  const [posterImageUrl, setPosterImageUrl] = useState<string>("");
  
  // Orchestra groups state
  const [orchestras, setOrchestras] = useState<Orchestra[]>([]);

  // Fetch content on component mount
  useEffect(() => {
    async function fetchConcertContent() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/content/concerts');
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.content) {
          setContentId(data.content.id);
          setConcertName(data.content.concert_name);
          setPosterImageUrl(data.content.poster_image_url || "");
          // Set the no concert text if available, otherwise use default
          setNoConcertText(data.content.no_concert_text || "No concert order is available at this time. Please check back later.");
          if (data.content.orchestras && data.content.orchestras.length > 0) {
            setOrchestras(data.content.orchestras);
          }
        }
      } catch (error) {
        console.error("Failed to fetch concert content:", error);
        toast.error("Failed to load concert content", {
          description: "There was an error loading the content. Please try refreshing the page.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchConcertContent();
  }, []);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up object URL to prevent memory leaks
      if (posterImagePreview && posterImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(posterImagePreview);
      }
    };
  }, [posterImagePreview]);

  // Handle poster image upload
  const handlePosterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Revoke previous URL if it exists to prevent memory leaks
        if (posterImagePreview && posterImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(posterImagePreview);
        }
        
        // Create a preview URL for the image
        const url = URL.createObjectURL(file);
        setPosterImagePreview(url);
        
        // Convert to base64 for API submission
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setPosterImageUrl(base64String);
        };
        reader.onerror = () => {
          throw new Error("FileReader failed to read the file");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing image:", error);
        toast.error("Failed to process image", {
          description: "There was an error processing the selected image.",
        });
      }
    }
  };

  // Remove poster image
  const removePosterImage = () => {
    if (posterImagePreview && posterImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(posterImagePreview);
    }
    setPosterImagePreview(null);
    setPosterImageUrl("");
  };

  // Handler for updating orchestra name
  const handleOrchestraNameChange = (index: number, value: string) => {
    const newOrchestras = [...orchestras];
    newOrchestras[index].name = value;
    setOrchestras(newOrchestras);
  };

  // Handler for updating a song
  const handleSongChange = (orchestraIndex: number, songIndex: number, value: string) => {
    const newOrchestras = [...orchestras];
    newOrchestras[orchestraIndex].songs[songIndex] = value;
    setOrchestras(newOrchestras);
  };

  // Add a new song to an orchestra
  const addSong = (orchestraIndex: number) => {
    const newOrchestras = [...orchestras];
    newOrchestras[orchestraIndex].songs.push("New Song");
    setOrchestras(newOrchestras);
  }; 

  // Remove a song from an orchestra
  const removeSong = (orchestraIndex: number, songIndex: number) => {
    const newOrchestras = [...orchestras];
    newOrchestras[orchestraIndex].songs.splice(songIndex, 1);
    setOrchestras(newOrchestras);
  };     

  // Move a song up in the order within its orchestra group
  const moveSongUp = (orchestraIndex: number, songIndex: number) => {
    if (songIndex <= 0) return; // Already at the top
    const newOrchestras = [...orchestras];
    // Swap with the previous song
    [newOrchestras[orchestraIndex].songs[songIndex - 1], newOrchestras[orchestraIndex].songs[songIndex]] = 
      [newOrchestras[orchestraIndex].songs[songIndex], newOrchestras[orchestraIndex].songs[songIndex - 1]];
    setOrchestras(newOrchestras);
  };

  // Move a song down in the order within its orchestra group
  const moveSongDown = (orchestraIndex: number, songIndex: number) => {
    const songsLength = orchestras[orchestraIndex].songs.length;
    if (songIndex >= songsLength - 1) return; // Already at the bottom
    const newOrchestras = [...orchestras];
    // Swap with the next song
    [newOrchestras[orchestraIndex].songs[songIndex], newOrchestras[orchestraIndex].songs[songIndex + 1]] = 
      [newOrchestras[orchestraIndex].songs[songIndex + 1], newOrchestras[orchestraIndex].songs[songIndex]];
    setOrchestras(newOrchestras);
  };

  // Add a new orchestra group
  const addOrchestraGroup = () => {
    setOrchestras([...orchestras, { id: uuidv4(), name: "New Orchestra", songs: [""] }]);
  };

  // Remove an orchestra group
  const removeOrchestraGroup = (index: number) => {
    const newOrchestras = [...orchestras];
    newOrchestras.splice(index, 1);
    setOrchestras(newOrchestras);
  };

  // Move an orchestra group up in the order
  const moveOrchestraUp = (index: number) => {
    if (index <= 0) return; // Already at the top
    const newOrchestras = [...orchestras];
    // Swap with the previous item
    [newOrchestras[index - 1], newOrchestras[index]] = [newOrchestras[index], newOrchestras[index - 1]];
    setOrchestras(newOrchestras);
  };

  // Move an orchestra group down in the order
  const moveOrchestraDown = (index: number) => {
    if (index >= orchestras.length - 1) return; // Already at the bottom
    const newOrchestras = [...orchestras];
    // Swap with the next item
    [newOrchestras[index], newOrchestras[index + 1]] = [newOrchestras[index + 1], newOrchestras[index]];
    setOrchestras(newOrchestras);
  };

  // Save changes
  const saveChanges = async () => {
    setIsSaving(true);
    
    try {
      // Validate data before sending
      const validOrchestras = orchestras.map(orchestra => ({
        ...orchestra,
        songs: orchestra.songs.map(song => song.trim() || "Untitled") // Ensure no empty strings
      }));
      
      const payload: ConcertsContent = {
        // Convert to number if it's a string ID, or omit for new entries
        id: contentId ? Number(contentId) : undefined,
        concert_name: concertName || "Untitled Concert",
        poster_image_url: posterImageUrl,
        no_concert_text: noConcertText,
        orchestras: validOrchestras
      };
      
      const response = await fetch('/api/admin/content/concerts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update concert content');
      }
      
      toast.success("Changes saved", {
        description: "Your concert information has been updated."
      });
    } catch (error) {
      console.error("Failed to save concert content:", error);
      toast.error("Failed to save changes", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading concert content...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
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
              <BreadcrumbLink href="/admin/content/concerts">Concerts</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Concert Content Management</CardTitle>
          <CardDescription>
            Update the content of your website&apos;s concert page. The changes will be reflected on the live site. This website is intended to be used on a desktop device. 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Currently Published Content</h3>
            <p>Concert Name: <span className="font-mono">{concertName || "(empty)"}</span></p>
            <p>Poster Image: {posterImageUrl ? "Uploaded" : "None"}</p>
            <p>Orchestra Groups: {orchestras.length} groups configured</p>
            <p>Total Songs: {orchestras.reduce((total, orchestra) => total + orchestra.songs.length, 0)}</p>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="orchestras">Orchestra Groups</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Concert Settings</CardTitle>
              <CardDescription>
                Update the concert name and primary settings that appear on the public concert page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="concertName">Concert Name</Label>
                <Input
                  id="concertName"
                  value={concertName}
                  onChange={(e) => setConcertName(e.target.value)}
                  placeholder="e.g. Fall, Winter, Spring, Senior"
                />
              </div>
              
              {/* Add No Concert Text field */}
              <div className="space-y-2">
                <Label htmlFor="noConcertText">
                  No Concert Order Text
                </Label>
                <Input
                  id="noConcertText"
                  value={noConcertText}
                  onChange={(e) => setNoConcertText(e.target.value)}
                  placeholder="Text to display when no concert order is available"
                />
                <p className="text-sm text-muted-foreground">
                  This text will be displayed when no orchestra groups are defined.
                </p>
              </div>
              
              <div className="space-y-4">
                <Label>Concert Poster</Label>
                <div className="relative aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-lg border border-dashed">
                  {(posterImagePreview || posterImageUrl) ? (
                    <div className="relative h-full w-full bg-gray-100">
                      <Image 
                        src={posterImagePreview || posterImageUrl}
                        alt="Poster preview"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          // Hide the image on error
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                    <label htmlFor="poster-image-upload">
                      <Upload className="h-4 w-4" />
                      Choose Poster
                    </label>
                  </Button>
                  <Input
                    id="poster-image-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handlePosterImageUpload}
                  />
                  {(posterImagePreview || posterImageUrl) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={removePosterImage}
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
              
              <Button onClick={saveChanges} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orchestra Groups Tab */}
        <TabsContent value="orchestras">
          <Card>
            <CardHeader>
              <CardTitle>Orchestra Groups</CardTitle>
              <CardDescription>
                Manage the orchestra groups and their performances that will be displayed in the concert order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {orchestras.map((orchestra, orchestraIndex) => (
                  <div 
                    key={orchestra.id} 
                    className="p-4 border rounded-md shadow-sm bg-white"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-2">
                          <Label htmlFor={`orchestra-${orchestraIndex}`}>
                            Orchestra Name
                          </Label>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => moveOrchestraUp(orchestraIndex)}
                              disabled={orchestraIndex === 0}
                              title="Move Up"
                            >
                              <span className="sr-only">Move Up</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="m18 15-6-6-6 6"/>
                              </svg>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => moveOrchestraDown(orchestraIndex)}
                              disabled={orchestraIndex === orchestras.length - 1}
                              title="Move Down"
                            >
                              <span className="sr-only">Move Down</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="m6 9 6 6 6-6"/>
                              </svg>
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id={`orchestra-${orchestraIndex}`}
                            value={orchestra.name}
                            onChange={(e) => handleOrchestraNameChange(orchestraIndex, e.target.value)}
                            className="mb-2"
                          />
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeOrchestraGroup(orchestraIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Label>Performances</Label>
                    <div className="ml-4 space-y-2 mt-2">
                      {orchestra.songs.map((song, songIndex) => (
                        <div key={songIndex} className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              value={song}
                              onChange={(e) =>
                                handleSongChange(orchestraIndex, songIndex, e.target.value)
                              }
                              placeholder="Enter song title"
                            />
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => moveSongUp(orchestraIndex, songIndex)}
                              disabled={songIndex === 0}
                              title="Move Song Up"
                            >
                              <span className="sr-only">Move Song Up</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="m18 15-6-6-6 6"/>
                              </svg>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => moveSongDown(orchestraIndex, songIndex)}
                              disabled={songIndex === orchestra.songs.length - 1}
                              title="Move Song Down"
                            >
                              <span className="sr-only">Move Song Down</span>
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="m6 9 6 6 6-6"/>
                              </svg>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => removeSong(orchestraIndex, songIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addSong(orchestraIndex)}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Song
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button onClick={addOrchestraGroup} className="w-full">
                  <Plus className="mr-2 h-4 w-4" /> Add Orchestra Group
                </Button>
              </div>
              
              <Separator className="my-6" />
              
              <Button onClick={saveChanges} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save All Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}