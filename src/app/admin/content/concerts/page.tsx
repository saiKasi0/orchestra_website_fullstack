"use client";

import { useState } from "react";
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
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";


interface Orchestra {
  name: string;
  songs: string[];
}

export default function ConcertContentManagement() {
  // Concert name state
  const [concertName, setConcertName] = useState<string>("Fall");
  // TODO: Fetch initial concert name from backend API

  // Orchestra groups state
  const [orchestras, setOrchestras] = useState<Orchestra[]>([
    {
      name: "Camerata Orchestra",
      songs: ["Geometric Dances #3, Triangle Dance", "Angry Spirits"],
    },
    {
      name: "Concert Orchestra",
      songs: ["Dark Catacombs", "Danse Diabolique"],
    },
    {
      name: "Philharmonic Orchestra",
      songs: ["Supernova", "Music from Wicked"],
    },
    {
      name: "Symphony Orchestra",
      songs: [
        "Simple Symphony, Mvt 1: Boisterous Bourrée",
        "Halloween Spooktacular",
      ],
    },
    {
      name: "Chamber Orchestra",
      songs: ["Serenade for Strings, Mvt: Élégie", "Thriller"],
    },
  ]);
  // TODO: Fetch orchestra groups data from backend API instead of using hardcoded data

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
  // TODO: Consider real-time updates to backend or track changes for later submission


  // Add a new song to an orchestra
  const addSong = (orchestraIndex: number) => {
    const newOrchestras = [...orchestras];
    newOrchestras[orchestraIndex].songs.push("");
    setOrchestras(newOrchestras);
  }; 
  // TODO: Add song to backend database


  // Remove a song from an orchestra
  const removeSong = (orchestraIndex: number, songIndex: number) => {
    const newOrchestras = [...orchestras];
    newOrchestras[orchestraIndex].songs.splice(songIndex, 1);
    setOrchestras(newOrchestras);
  };     
  // TODO: Remove song from backend database

  // Add a new orchestra group
  const addOrchestraGroup = () => {
    setOrchestras([...orchestras, { name: "New Orchestra", songs: [""] }]);
  };
  // TODO: Add orchestra group to backend database

  // Remove an orchestra group
  const removeOrchestraGroup = (index: number) => {
    const newOrchestras = [...orchestras];
    newOrchestras.splice(index, 1);
    setOrchestras(newOrchestras);
  };
  // TODO: Remove orchestra group from backend database

  // Save changes (placeholder for backend integration)
  const saveChanges = async () => {
    // TODO: Send updated concert data to backend API
    console.log("Saving concert data:", { concertName, orchestras });
    
    toast.success("Changes saved", {
      description: "Your concert information has been updated."
    });
  };

  return (
    <div className="container mx-auto py-10">
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
            <BreadcrumbLink href="/admin/content/concerts">Homepage</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    <Card className="mb-6">
        <CardHeader>
        <CardTitle>Concert Content Management</CardTitle>
        <CardDescription>
            Update the content of your website&apos;s concert page. The changes will be reflected on the live site. This website is intended to be used on a desktop device. 
        </CardDescription>
        </CardHeader>
    </Card>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="orchestras">Orchestra Groups</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="concertName">Concert Name</Label>
                <Input
                  id="concertName"
                  value={concertName}
                  onChange={(e) => setConcertName(e.target.value)}
                  placeholder="e.g. Fall, Winter, Spring"
                />
              </div>
              <Button onClick={saveChanges} className="mt-4">
                <Save className="mr-2 h-4 w-4" /> Save Changes
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
                    key={orchestraIndex} 
                    className="p-4 border rounded-md shadow-sm bg-white"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-full">
                        <Label htmlFor={`orchestra-${orchestraIndex}`}>
                          Orchestra Name
                        </Label>
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
                          <Input
                            value={song}
                            onChange={(e) =>
                              handleSongChange(orchestraIndex, songIndex, e.target.value)
                            }
                            placeholder="Enter song title"
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => removeSong(orchestraIndex, songIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
              
              <Button onClick={saveChanges} className="mt-4">
                <Save className="mr-2 h-4 w-4" /> Save All Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Concert Order Preview</CardTitle>
              <CardDescription>
                Preview how the concert order will appear on the public page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 border rounded-lg bg-gray-50">
                <h2 className="text-3xl font-bold mb-6">{concertName} Concert Order</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {orchestras.map((orchestra, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow">
                      <h3 className="text-xl font-semibold mb-2">
                        {index + 1}. {orchestra.name}
                      </h3>
                      <ul className="list-disc list-inside">
                        {orchestra.songs.map((song, songIndex) => (
                          <li key={songIndex} className="text-gray-700">
                            {song}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}