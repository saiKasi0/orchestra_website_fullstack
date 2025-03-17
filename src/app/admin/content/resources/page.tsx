"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { toast } from "sonner"

const ResourcesContentManagement = () => {
  // TODO: Fetch initial content from API
  const [content, setContent] = useState({
    calendar_url: "https://calendar.google.com/calendar/embed?src=c_20p6293m4hda8ecdv1k63ki418%40group.calendar.google.com&amp",
    support_title: "Just For Some Support :)",
    youtube_url: "https://www.youtube.com/embed/QkklAQLhnQY?si=HGTk2aKkxV3r1ITb",
  })

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setContent(prev => ({ ...prev, [name]: value }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // TODO: Implement API call to save content
      // await saveResourcesContent(content)
      
      toast.success("Content updated", {
        description: "Resources page has been successfully updated."
      })
    } catch (error) {
      toast.error("Failed to update content", {
        description: "There was an error updating the resources page. Please try again."
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
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
            <BreadcrumbLink href="/admin/content/resources">Resources</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Resources Page Management</CardTitle>
          <CardDescription>
            Update the content of your website&apos;s resources page. The changes will be reflected on the live site. This website is intended to be used on a desktop device. 
          </CardDescription>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="calendar">
          <TabsList className="mb-4">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="support">Support Video</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Orchestra Calendar</CardTitle>
                <CardDescription>
                  Update the Google Calendar embed that is displayed on your resources page. The changes will be reflected on the live site.

                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="calendar_url" className="text-sm font-medium">
                      Calendar Embed URL
                    </label>
                    <Input
                      id="calendar_url"
                      name="calendar_url"
                      value={content.calendar_url}
                      onChange={handleContentChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      The full Google Calendar embed URL from your Google Calendar settings.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium">Preview</h3>
                    <div className="border rounded-lg p-2 bg-slate-50">
                      <iframe
                        title="Calendar Preview"
                        src={content.calendar_url}
                        width="100%"
                        height="400"
                        className="border-0 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support Video Section</CardTitle>
                <CardDescription>
                  Update the video and title in the support section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="support_title" className="text-sm font-medium">
                      Section Title
                    </label>
                    <Input
                      id="support_title"
                      name="support_title"
                      value={content.support_title}
                      onChange={handleContentChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="youtube_url" className="text-sm font-medium">
                      YouTube Embed URL
                    </label>
                    <Input
                      id="youtube_url"
                      name="youtube_url"
                      value={content.youtube_url}
                      onChange={handleContentChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      The full YouTube video embed URL (https://www.youtube.com/embed/VIDEO_ID).
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium">Preview</h3>
                    <div className="border rounded-lg p-2 bg-slate-50">
                      <p className="mb-2 text-gray-600">{content.support_title}</p>
                      <iframe
                        title="YouTube Preview"
                        width="100%"
                        height="300"
                        src={content.youtube_url}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  )
}

export default ResourcesContentManagement