"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Upload, Trash2, Loader2, ImageIcon, PlusCircle, GripVertical } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HomepageContentManagement() {
  const router = useRouter();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  // State for event cards
  const [eventCards, setEventCards] = useState([
    {
      id: "concerts",
      title: "Concerts",
      description: "View our upcoming performances and concert schedule.",
      link_text: "View Concert Schedule →",
      link_url: "/concerts"
    },
    {
      id: "competitions",
      title: "Competitions",
      description: "Explore our orchestra's participation in various prestigious competitions.",
      link_text: "View Competitions →",
      link_url: "/competitions"
    },
    {
      id: "trips",
      title: "Trips & Socials",
      description: "Discover our adventures and memorable moments beyond the stage.",
      link_text: "Explore Our Journeys →",
      link_url: "/trips-and-socials"
    }
  ]);

  // Staff cards state
  const [staffMembers, setStaffMembers] = useState([
    {
      id: "1",
      name: "Jane Smith",
      position: "Orchestra Director",
      image_url: "/images/placeholder-staff.jpg", 
      bio: "Ms. Smith has been leading our orchestra program for over 10 years."
    },
    {
      id: "2", 
      name: "John Davis",
      position: "Associate Director",
      image_url: "/images/placeholder-staff.jpg",
      bio: "Mr. Davis specializes in string pedagogy and chamber music."
    }
  ]);

  // Leadership cards state
  const [leadershipSections, setLeadershipSections] = useState([
    {
      id: "gold",
      name: "Gold Leadership",
      members: [
        {
          id: "g1",
          name: "Emma Johnson",
          image_url: "/images/placeholder-student.jpg"
        },
        {
          id: "g2",
          name: "Michael Lee",
          image_url: "/images/placeholder-student.jpg"
        }
      ]
    },
    {
      id: "blue",
      name: "Blue Leadership",
      members: [
        {
          id: "b1",
          name: "Sophia Garcia",
          image_url: "/images/placeholder-student.jpg"
        }
      ]
    }
  ]);

  // Handle content text changes
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContent(prev => ({ ...prev, [name]: value }));
  };

  // Handle image upload (mock function for now)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a preview URL for the image
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  // Handle event card changes
  const handleEventCardChange = (index: number, field: string, value: string) => {
    const newEventCards = [...eventCards];
    // @ts-expect-error - We know these fields exist
    newEventCards[index][field] = value;
    setEventCards(newEventCards);
  };

  // Handle staff member changes
  const handleStaffChange = (index: number, field: string, value: string) => {
    const newStaffMembers = [...staffMembers];
    // @ts-expect-error - We know these fields exist
    newStaffMembers[index][field] = value;
    setStaffMembers(newStaffMembers);
  };

  // Handle leadership member changes
  const handleLeadershipChange = (sectionIndex: number, memberIndex: number, field: string, value: string) => {
    const newSections = [...leadershipSections];
    // @ts-ignore - We know these fields exist
    newSections[sectionIndex].members[memberIndex][field] = value;
    setLeadershipSections(newSections);
  };

  // Add a new event card
  const addEventCard = () => {
    setEventCards([...eventCards, {
      id: `event-${Date.now()}`,
      title: "New Event",
      description: "Description for the new event",
      link_text: "Learn More →",
      link_url: "/"
    }]);
  };

  // Add a new staff member
  const addStaffMember = () => {
    setStaffMembers([...staffMembers, {
      id: `staff-${Date.now()}`,
      name: "New Staff Member",
      position: "Position",
      image_url: "/images/placeholder-staff.jpg",
      bio: "Staff biography"
    }]);
  };

  // Add a new leadership section
  const addLeadershipSection = () => {
    const newSectionId = `section-${Date.now()}`;
    setLeadershipSections([
      ...leadershipSections, 
      {
        id: newSectionId,
        name: "New Section",
        members: []
      }
    ]);
  };

  // Remove a leadership section
  const removeLeadershipSection = (sectionIndex: number) => {
    const newSections = [...leadershipSections];
    newSections.splice(sectionIndex, 1);
    setLeadershipSections(newSections);
  };

  // Update section name
  const updateSectionName = (sectionIndex: number, name: string) => {
    const newSections = [...leadershipSections];
    newSections[sectionIndex].name = name;
    setLeadershipSections(newSections);
  };

  // Add a member to a specific section
  const addLeadershipMember = (sectionIndex: number) => {
    const newSections = [...leadershipSections];
    newSections[sectionIndex].members.push({
      id: `member-${Date.now()}`,
      name: "New Leadership Member",
      image_url: "/images/placeholder-student.jpg"
    });
    setLeadershipSections(newSections);
  };

  // Remove a member from a section
  const removeLeadershipMember = (sectionIndex: number, memberIndex: number) => {
    const newSections = [...leadershipSections];
    newSections[sectionIndex].members.splice(memberIndex, 1);
    setLeadershipSections(newSections);
  };

  // Remove a leadership member
  const removeLeadershipMemberOld = (index: number) => {
    const newLeadershipMembers = [...leadershipMembers];
    newLeadershipMembers.splice(index, 1);
    setLeadershipMembers(newLeadershipMembers);
  };

  // Mock save function
  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    // Show success message or redirect
  };

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/content">Content</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/content/homepage">Homepage</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Homepage Content Management</CardTitle>
          <CardDescription>
            Update the content of your website&apos;s homepage. The changes will be reflected on the live site.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="mb-4 grid grid-cols-5 gap-4 md:flex">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="about">About Section</TabsTrigger>
          <TabsTrigger value="events">Featured Events</TabsTrigger>
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
                      <div className="relative h-[300px] w-full">
                        <Image 
                          src={imagePreview || content.hero_image_url}
                          alt="Hero preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-[300px] w-full items-center justify-center bg-muted">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
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
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setImagePreview(null)}>
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
                  <p className="text-sm text-muted-foreground">Displayed as: &quot;250+ Students&quot;</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stats_performances">Annual Performances</Label>
                  <Input
                    id="stats_performances"
                    name="stats_performances"
                    value={content.stats_performances}
                    onChange={handleContentChange}
                  />
                  <p className="text-sm text-muted-foreground">Displayed as: &quot;20+ Annual Performances&quot;</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stats_years">Years of Excellence</Label>
                  <Input
                    id="stats_years"
                    name="stats_years"
                    value={content.stats_years}
                    onChange={handleContentChange}
                  />
                  <p className="text-sm text-muted-foreground">Displayed as: &quot;15 Years of Excellence&quot;</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Events Section</CardTitle>
              <CardDescription>Manage the featured event cards shown on your homepage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="featured_events_title">Section Title</Label>
                <Input
                  id="featured_events_title"
                  name="featured_events_title"
                  value={content.featured_events_title}
                  onChange={handleContentChange}
                />
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Event Cards</h3>
                  <Button onClick={addEventCard} size="sm" className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    Add Card
                  </Button>
                </div>

                {eventCards.map((card, index) => (
                  <Card key={card.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium">Card {index + 1}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeEventCard(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`card_title_${index}`}>Title</Label>
                        <Input
                          id={`card_title_${index}`}
                          value={card.title}
                          onChange={(e) => handleEventCardChange(index, 'title', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`card_description_${index}`}>Description</Label>
                        <Textarea
                          id={`card_description_${index}`}
                          value={card.description}
                          onChange={(e) => handleEventCardChange(index, 'description', e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`card_link_text_${index}`}>Button Text</Label>
                          <Input
                            id={`card_link_text_${index}`}
                            value={card.link_text}
                            onChange={(e) => handleEventCardChange(index, 'link_text', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`card_link_url_${index}`}>Link URL</Label>
                          <Input
                            id={`card_link_url_${index}`}
                            value={card.link_url}
                            onChange={(e) => handleEventCardChange(index, 'link_url', e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

                {staffMembers.map((staff, index) => (
                  <Card key={staff.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-medium">{staff.name}</CardTitle>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeStaffMember(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                      
                      <div className="space-y-4">
                        <Label>Profile Image</Label>
                        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border border-dashed">
                          {staff.image_url ? (
                            <div className="relative h-full w-full">
                              <Image 
                                src={staff.image_url}
                                alt={`${staff.name} profile`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              <ImageIcon className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
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
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                  {leadershipSections.map((section, sectionIndex) => (
                    <AccordionItem key={section.id} value={section.id} className="border border-muted rounded-lg mb-4">
                      <div className="flex items-center justify-between px-4">
                        <AccordionTrigger className="py-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
                            <span>{section.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {section.members.length} {section.members.length === 1 ? 'member' : 'members'}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLeadershipSection(sectionIndex);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
                                      {member.image_url ? (
                                        <div className="relative h-full w-full">
                                          <Image 
                                            src={member.image_url}
                                            alt={`${member.name} profile`}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted">
                                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                      )}
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
                  ))}
                </Accordion>
                
                {leadershipSections.length === 0 && (
                  <div className="py-8 text-center border border-dashed rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground">No leadership sections yet.</p>
                    <Button onClick={addLeadershipSection} variant="outline" size="sm" className="mt-2">
                      Add First Section
                    </Button>
                  </div>
                )}
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