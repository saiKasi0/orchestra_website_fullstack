"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Upload, Trash2, Loader2, ImageIcon, PlusCircle, GripVertical, UserCircle, ArrowUp, ArrowDown } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { 
  EventCard, 
  StaffMember, 
  LeadershipSection, 
  LeadershipMember 
} from "@/types/homepage";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

export default function HomepageContentManagementPage() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for homepage content
  const [content, setContent] = useState({
    id: "",
    hero_image_url: "",
    hero_title: "Cypress Ranch Orchestra",
    hero_subtitle: "Inspiring musical excellence since 2008",
    about_title: "About Our Orchestra",
    about_description: "The Cypress Ranch High School Orchestra program is dedicated to fostering musical excellence, personal growth, and community engagement through exceptional orchestral education.",
    featured_events_title: "Upcoming Events",
    stats_students: "250",
    stats_performances: "20",
    stats_years: "15",
    staff_leadership_title: "Our Staff & Student Leadership"
  });

  // State for event cards with proper typing
  const [eventCards, setEventCards] = useState<EventCard[]>([]);

  // Staff cards state with proper typing
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  // Leadership cards state with proper typing
  const [leadershipSections, setLeadershipSections] = useState<LeadershipSection[]>([]);
  
  // Memoize the fetch function to prevent recreation on every render
  const fetchHomepageContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/content/homepage');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.content) {
        // Update the content state
        setContent({
          id: data.content.id,
          hero_image_url: data.content.hero_image_url || "",
          hero_title: data.content.hero_title || "Cypress Ranch Orchestra",
          hero_subtitle: data.content.hero_subtitle || "Inspiring musical excellence since 2008",
          about_title: data.content.about_title || "About Our Orchestra",
          about_description: data.content.about_description || "",
          featured_events_title: data.content.featured_events_title || "Upcoming Events",
          stats_students: data.content.stats_students || "100+",
          stats_performances: data.content.stats_performances || "20+",
          stats_years: data.content.stats_years || "15",
          staff_leadership_title: data.content.staff_leadership_title || "Our Staff & Student Leadership"
        });
        
        // Update the event cards, staff members, and leadership sections
        setEventCards(data.content.event_cards || []);
        setStaffMembers(data.content.staff_members || []);
        setLeadershipSections(data.content.leadership_sections || []);
      }
    } catch (error) {
      console.error("Failed to fetch homepage content:", error);
      toast.error("Failed to load homepage content", {
        description: "There was an error loading the content. Please try refreshing the page.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Fetch initial data
  useEffect(() => {
    fetchHomepageContent();
  }, [fetchHomepageContent]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up object URL to prevent memory leaks
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle content text changes - memoized
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle image upload - memoized
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Revoke previous URL if it exists to prevent memory leaks
        if (imagePreview && imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(imagePreview);
        }
        
        // Create a preview URL for the image
        const url = URL.createObjectURL(file);
        setImagePreview(url);
        
        // Convert to base64 for API submission
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setContent(prev => ({
            ...prev,
            hero_image_url: base64String
          }));
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
  }, [imagePreview]);

  // Memoize event handlers for event cards

  // Memoize staff member changes
  const handleStaffChange = useCallback((index: number, field: keyof StaffMember, value: string) => {
    setStaffMembers(prev => {
      const newStaffMembers = [...prev];
      newStaffMembers[index][field] = value;
      return newStaffMembers;
    });
  }, []);

  // Memoize leadership member changes
  const handleLeadershipChange = useCallback((sectionIndex: number, memberIndex: number, field: keyof LeadershipMember, value: string) => {
    setLeadershipSections(prev => {
      const newSections = [...prev];
      newSections[sectionIndex].members[memberIndex][field] = value;
      return newSections;
    });
  }, []);

  // Optimize add/remove functions with useCallback


  // Add a new staff member
  const addStaffMember = useCallback(() => {
    setStaffMembers(prev => [...prev, {
      id: uuidv4(),
      name: "New Staff Member",
      position: "Position",
      image_url: "", 
      bio: "Staff biography"
    }]);
  }, []);
  
  // Remove a staff member
  const removeStaffMember = useCallback((index: number) => {
    setStaffMembers(prev => {
      const newStaffMembers = [...prev];
      newStaffMembers.splice(index, 1);
      return newStaffMembers;
    });
  }, []);

  // Move staff member up
  const moveStaffMemberUp = useCallback((index: number) => {
    if (index <= 0) return; // Already at the top
    setStaffMembers(prev => {
      const newStaffMembers = [...prev];
      [newStaffMembers[index - 1], newStaffMembers[index]] = [newStaffMembers[index], newStaffMembers[index - 1]]; // Swap
      return newStaffMembers;
    });
  }, []);

  // Move staff member down
  const moveStaffMemberDown = useCallback((index: number) => {
    setStaffMembers(prev => {
      if (index >= prev.length - 1) return prev; // Already at the bottom
      const newStaffMembers = [...prev];
      [newStaffMembers[index], newStaffMembers[index + 1]] = [newStaffMembers[index + 1], newStaffMembers[index]]; // Swap
      return newStaffMembers;
    });
  }, []);

  // Add a new leadership section
  const addLeadershipSection = useCallback(() => {
    const newSectionId = uuidv4();
    setLeadershipSections((prevSections) => {
      return [
        ...prevSections, 
        {
          id: newSectionId,
          name: "New Section",
          color: "#fcd207", 
          members: []
        }
      ];
    });
  }, []);

  // Remove a leadership section
  const removeLeadershipSection = useCallback((sectionIndex: number) => {
    setLeadershipSections(prev => {
      const newSections = [...prev];
      newSections.splice(sectionIndex, 1);
      return newSections;
    });
  }, []);

  // Move leadership section up
  const moveLeadershipSectionUp = useCallback((index: number) => {
    if (index <= 0) return; // Already at the top
    setLeadershipSections(prev => {
      const newSections = [...prev];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]]; // Swap
      return newSections;
    });
  }, []);

  // Move leadership section down
  const moveLeadershipSectionDown = useCallback((index: number) => {
    setLeadershipSections(prev => {
      if (index >= prev.length - 1) return prev; // Already at the bottom
      const newSections = [...prev];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]; // Swap
      return newSections;
    });
  }, []);

  // Update section name
  const updateSectionName = useCallback((sectionIndex: number, name: string) => {
    setLeadershipSections(prev => {
      const newSections = [...prev];
      newSections[sectionIndex].name = name;
      return newSections;
    });
  }, []);

  // Add a member to a specific section
  const addLeadershipMember = useCallback((sectionIndex: number) => {
    setLeadershipSections(prev => {
      const newSections = [...prev];
      newSections[sectionIndex].members.push({
        id: uuidv4(),
        name: "New Leadership Member",
        image_url: "" // Removed placeholder image path
      });
      return newSections;
    });
  }, []);

  // Remove a member from a section
  const removeLeadershipMember = useCallback((sectionIndex: number, memberIndex: number) => {
    setLeadershipSections(prev => {
      const newSections = [...prev];
      newSections[sectionIndex].members.splice(memberIndex, 1);
      return newSections;
    });
  }, []);

  // Handle staff member image upload - memoized
  const handleStaffImageUpload = useCallback(async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Convert to base64 for API submission
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setStaffMembers(prev => {
            const newStaffMembers = [...prev];
            newStaffMembers[index].image_url = base64String;
            return newStaffMembers;
          });
        };
        reader.onerror = () => {
          throw new Error("FileReader failed to read the file");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing staff image:", error);
        toast.error("Failed to process image", {
          description: "There was an error processing the selected image.",
        });
      }
    }
  }, []);

  // Handle leadership member image upload - memoized
  const handleLeaderImageUpload = useCallback(async (sectionIndex: number, memberIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Convert to base64 for API submission
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setLeadershipSections(prev => {
            const newSections = [...prev];
            newSections[sectionIndex].members[memberIndex].image_url = base64String;
            return newSections; 
          });
        };
        reader.onerror = () => {
          throw new Error("FileReader failed to read the file");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing leadership image:", error);
        toast.error("Failed to process image", {
          description: "There was an error processing the selected image.",
        });
      }
    }
  }, []);

  // Save function - memoized
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    
    try {
      // Prepare the payload to match the API schema
      const payload = {
        ...content,
        event_cards: eventCards,
        staff_members: staffMembers,
        leadership_sections: leadershipSections
      };
      
      // Send the data to the API
      const response = await fetch('/api/admin/content/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update homepage content');
      }
      
      // Show success message - ensure toast is visible
      toast.success("Homepage content updated", {
        description: "Your changes have been saved successfully.",
      });
      
      // Refresh the page content
      router.refresh();
      
    } catch (error) {
      console.error("Failed to save homepage content:", error);
      toast.error("Failed to save changes", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",

      });
    } finally {
      setIsSaving(false);
    }
  }, [content, eventCards, staffMembers, leadershipSections, router]);

  // Memoized derived states
  const hasStaffMembers = useMemo(() => staffMembers.length > 0, [staffMembers]);
  const hasLeadershipSections = useMemo(() => leadershipSections.length > 0, [leadershipSections]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading homepage content...</p>
      </div>
    );
  }

  return (
    <AdminPageLayout allowedRoles={["admin", "leadership"]} title="Homepage Content Management">
      <div className="space-y-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Homepage Content Management</CardTitle>
            <CardDescription>
              Update the content of your website&apos;s homepage. The changes will be reflected on the live site. This website is intended to be used on a desktop device. 
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="mb-4 grid grid-cols-5 gap-4 md:flex">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="about">About Section</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="staff">Staff & Leadership</TabsTrigger>
          </TabsList>

          {/* Hero Section Tab */}
          <TabsContent value="hero" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
                <CardDescription>
                  Edit the main hero section that appears at the top of your homepage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left column - Image */}
                  <div className="space-y-4">
                    <Label htmlFor="hero-image">Hero Background Image</Label>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-dashed">
                      {(imagePreview || content.hero_image_url) ? (
                        <div className="relative h-[300px] w-full bg-blue-900">
                          {(imagePreview || content.hero_image_url) && (
                            <Image 
                              src={imagePreview || content.hero_image_url}
                              alt="Hero preview"
                              fill
                              className="object-cover"
                              onError={(e) => {
                                // Hide the image on error
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="flex h-[300px] w-full items-center justify-center bg-blue-900">
                          <ImageIcon className="h-12 w-12 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                        <label htmlFor="hero-image-upload">
                          <Upload className="h-4 w-4" />
                          Choose Image
                        </label>
                      </Button>
                      <Input
                        id="hero-image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageUpload}
                      />
                      {(imagePreview || content.hero_image_url) && (
                        <Button variant="outline" size="sm" className="flex items-center gap-1" 
                          onClick={() => {
                            setImagePreview(null);
                            setContent(prev => ({...prev, hero_image_url: ""}));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Right column - Text content */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero_title">Title</Label>
                      <Input
                        id="hero_title"
                        name="hero_title"
                        value={content.hero_title}
                        onChange={handleContentChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hero_subtitle">Subtitle</Label>
                      <Input
                        id="hero_subtitle"
                        name="hero_subtitle"
                        value={content.hero_subtitle}
                        onChange={handleContentChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* About Section Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About Section</CardTitle>
                <CardDescription>Edit the about section of your homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="about_title">Section Title</Label>
                    <Input
                      id="about_title"
                      name="about_title"
                      value={content.about_title}
                      onChange={handleContentChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about_description">Description Text</Label>
                    <Textarea
                      id="about_description"
                      name="about_description"
                      value={content.about_description}
                      onChange={handleContentChange}
                      rows={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stats Section</CardTitle>
                <CardDescription>Edit the statistics displayed on your homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="stats_students">Number of Students</Label>
                    <Input
                      id="stats_students"
                      name="stats_students"
                      value={content.stats_students}
                      onChange={handleContentChange}
                    />
                    <p className="text-sm text-muted-foreground">Displayed as: &quot;{content.stats_students}+ Students&quot;</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stats_performances">Annual Performances</Label>
                    <Input
                      id="stats_performances"
                      name="stats_performances"
                      value={content.stats_performances}
                      onChange={handleContentChange}
                    />
                    <p className="text-sm text-muted-foreground">Displayed as: &quot;{content.stats_performances}+ Annual Performances&quot;</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stats_years">Years of Excellence</Label>
                    <Input
                      id="stats_years"
                      name="stats_years"
                      value={content.stats_years}
                      onChange={handleContentChange}
                    />
                    <p className="text-sm text-muted-foreground">Displayed as: &quot;{content.stats_years} Years of Excellence&quot;</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff & Leadership Tab */}
          <TabsContent value="staff" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff & Leadership Section</CardTitle>
                <CardDescription>Manage staff members and student leadership displayed on your homepage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="staff_leadership_title">Section Title</Label>
                  <Input
                    id="staff_leadership_title"
                    name="staff_leadership_title"
                    value={content.staff_leadership_title}
                    onChange={handleContentChange}
                  />
                </div>

                <Separator className="my-6" />

                {/* Staff Members */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Staff Members</h3>
                    <Button onClick={addStaffMember} size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Add Staff
                    </Button>
                  </div>

                  {hasStaffMembers ? (
                    staffMembers.map((staff, index) => (
                      <Card key={staff.id} className="relative">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-medium">{staff.name}</CardTitle>
                            <div className="flex items-center gap-1">
                              {/* Move Up Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveStaffMemberUp(index)}
                                disabled={index === 0}
                                title="Move Up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              {/* Move Down Button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => moveStaffMemberDown(index)}
                                disabled={index === staffMembers.length - 1}
                                title="Move Down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              {/* Remove Button */}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeStaffMember(index)}
                                title="Remove Staff Member"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`staff_name_${index}`}>Name</Label>
                              <Input
                                id={`staff_name_${index}`}
                                value={staff.name}
                                onChange={(e) => handleStaffChange(index, 'name', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`staff_position_${index}`}>Position</Label>
                              <Input
                                id={`staff_position_${index}`}
                                value={staff.position}
                                onChange={(e) => handleStaffChange(index, 'position', e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`staff_bio_${index}`}>Biography</Label>
                              <Textarea
                                id={`staff_bio_${index}`}
                                value={staff.bio}
                                onChange={(e) => handleStaffChange(index, 'bio', e.target.value)}
                                rows={3}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Profile Image</Label>
                            <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border border-dashed">
                              <div className="relative h-full w-full bg-muted">
                                {staff.image_url && (
                                  <Image 
                                    src={staff.image_url}
                                    alt={`${staff.name} profile`}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                      // Hide the image on error
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                )}
                                {!staff.image_url && (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <UserCircle className="h-10 w-10 text-muted-foreground" /> 
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                                <label htmlFor={`staff_image_upload_${index}`}>
                                  <Upload className="h-4 w-4" />
                                  Choose Image
                                </label>
                              </Button>
                              <Input
                                id={`staff_image_upload_${index}`}
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => handleStaffImageUpload(index, e)}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="py-8 text-center border border-dashed rounded-lg bg-muted/20">
                      <p className="text-sm text-muted-foreground">No staff members yet.</p>
                      <Button onClick={addStaffMember} variant="outline" size="sm" className="mt-2">
                        Add First Staff Member
                      </Button>
                    </div>
                  )}
                </div>

                <Separator className="my-6" />

                {/* Student Leadership */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Student Leadership</h3>
                    <Button onClick={addLeadershipSection} size="sm" className="flex items-center gap-1">
                      <PlusCircle className="h-4 w-4" />
                      Add New Section
                    </Button>
                  </div>
                  
                  <Accordion type="multiple" defaultValue={leadershipSections.map(section => section.id)}>
                    {hasLeadershipSections ? (
                      leadershipSections.map((section, sectionIndex) => (
                        <AccordionItem key={section.id} value={section.id} className="border border-muted rounded-lg mb-4">
                          <div className="flex items-center justify-between px-4">
                            <AccordionTrigger className="py-2 flex-grow hover:no-underline"> 
                              <div className="flex items-center gap-2">
                                <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 cursor-grab" />
                                <span>{section.name}</span>
                                <Badge variant="outline" className="ml-2">
                                  {section.members.length} {section.members.length === 1 ? 'member' : 'members'}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0"> 
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); moveLeadershipSectionUp(sectionIndex); }}
                                disabled={sectionIndex === 0}
                                title="Move Section Up"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); moveLeadershipSectionDown(sectionIndex); }}
                                disabled={sectionIndex === leadershipSections.length - 1}
                                title="Move Section Down"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLeadershipSection(sectionIndex);
                                }}
                                title="Remove Section"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <AccordionContent className="px-4 pb-4">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`section_name_${sectionIndex}`}>Section Name</Label>
                                <Input
                                  id={`section_name_${sectionIndex}`}
                                  value={section.name}
                                  onChange={(e) => updateSectionName(sectionIndex, e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor={`section_color_${sectionIndex}`}>Section Color</Label>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="h-6 w-6 rounded-full border shadow" 
                                    style={{ backgroundColor: section.color || '#3b82f6' }}
                                  />
                                  <Input
                                    id={`section_color_${sectionIndex}`}
                                    type="color"
                                    value={section.color || '#3b82f6'}
                                    className="w-16 h-8 p-1"
                                    onChange={(e) => {
                                      setLeadershipSections(prev => {
                                        const newSections = [...prev];
                                        newSections[sectionIndex].color = e.target.value;
                                        return newSections;
                                      });
                                    }}
                                  />
                                  <span className="text-xs text-muted-foreground">{section.color || '#3b82f6'}</span>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium">Members</h4>
                                <Button 
                                  onClick={() => addLeadershipMember(sectionIndex)} 
                                  size="sm" 
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="h-4 w-4" />
                                  Add Member
                                </Button>
                              </div>
                              
                              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {section.members.map((member, memberIndex) => (
                                  <Card key={member.id} className="relative">
                                    <CardHeader className="p-4 pb-2">
                                      <div className="flex justify-between items-start">
                                        <CardTitle className="text-base font-medium">{member.name}</CardTitle>
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          className="h-8 w-8 text-destructive"
                                          onClick={() => removeLeadershipMember(sectionIndex, memberIndex)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor={`leader_name_${sectionIndex}_${memberIndex}`}>Name</Label>
                                        <Input
                                          id={`leader_name_${sectionIndex}_${memberIndex}`}
                                          value={member.name}
                                          onChange={(e) => handleLeadershipChange(sectionIndex, memberIndex, 'name', e.target.value)}
                                        />
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <Label>Profile Image</Label>
                                        <div className="relative aspect-square w-full max-w-[150px] overflow-hidden rounded-lg border border-dashed">
                                          <div className="relative h-full w-full bg-muted"> 
                                            {member.image_url && (
                                              <Image 
                                                src={member.image_url}
                                                alt={`${member.name} profile`}
                                                fill
                                                className="object-cover"
                                                onError={(e) => {
                                                  // Hide the image on error
                                                  e.currentTarget.style.display = "none";
                                                }}
                                              />
                                            )}
                                            {!member.image_url && (
                                              <div className="flex h-full w-full items-center justify-center">
                                                <UserCircle className="h-8 w-8 text-muted-foreground" /> 
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Button variant="outline" size="sm" className="flex items-center gap-1" asChild>
                                            <label htmlFor={`leader_image_upload_${sectionIndex}_${memberIndex}`}>
                                              <Upload className="h-4 w-4" />
                                              Choose
                                            </label>
                                          </Button>
                                          <Input
                                            id={`leader_image_upload_${sectionIndex}_${memberIndex}`}
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => handleLeaderImageUpload(sectionIndex, memberIndex, e)}
                                          />
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                                
                                {section.members.length === 0 && (
                                  <div className="col-span-full py-8 text-center border border-dashed rounded-lg bg-muted/20">
                                    <p className="text-sm text-muted-foreground">No members in this section yet.</p>
                                    <Button 
                                      onClick={() => addLeadershipMember(sectionIndex)} 
                                      variant="outline" 
                                      size="sm" 
                                      className="mt-2"
                                    >
                                      Add Member
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))
                    ) : (
                      <div className="py-8 text-center border border-dashed rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">No leadership sections yet.</p>
                        <Button onClick={addLeadershipSection} variant="outline" size="sm" className="mt-2">
                          Add First Section
                        </Button>
                      </div>
                    )}
                  </Accordion>
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
    </AdminPageLayout>
  );
}