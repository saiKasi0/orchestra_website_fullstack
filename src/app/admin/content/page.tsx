import { Metadata } from "next";
import Link from "next/link";
import { 
  Trophy, 
  Music, 
  BookOpen, 
  Plane, 
  Award,
  Home 
} from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Content Management",
  description: "Manage website content",
};

interface ContentSectionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function ContentSection({ title, description, href, icon }: ContentSectionProps) {
  return (
    <Card className="group flex h-full flex-col justify-between overflow-hidden border-2 transition-all hover:border-primary hover:shadow-md">
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <div className="rounded-lg bg-muted p-2 transition-colors group-hover:bg-primary group-hover:text-white">
          {icon}
        </div>
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardFooter>
        <Button asChild className="w-full transition-all group-hover:bg-primary group-hover:text-white">
          <Link href={href}>Manage {title}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ContentManagement() {
  const contentSections: ContentSectionProps[] = [
    {
      title: "Homepage",
      description: "Edit hero section, about content, featured events, and statistics.",
      href: "/admin/content/homepage",
      icon: <Home className="h-5 w-5" />
    },
    {
      title: "Competitions",
      description: "Update competition information, results, and upcoming events.",
      href: "/admin/content/competitions",
      icon: <Trophy className="h-5 w-5" />
    },
    {
      title: "Concerts",
      description: "Edit concert schedule, descriptions, and ticket information.",
      href: "/admin/content/concerts",
      icon: <Music className="h-5 w-5" />
    },
    {
      title: "Resources",
      description: "Manage downloadable forms, practice materials, and links.",
      href: "/admin/content/resources",
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      title: "Trips & Socials",
      description: "Update information about upcoming trips and social events.",
      href: "/admin/content/trips",
      icon: <Plane className="h-5 w-5" />
    },
    {
      title: "Awards",
      description: "Showcase achievements and recognitions earned by the orchestra.",
      href: "/admin/content/awards",
      icon: <Award className="h-5 w-5" />
    }
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-start">
      <div className="container mx-auto flex max-w-5xl flex-col items-center px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="w-full">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/content">Content</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header */}
        <div className="my-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Content Management</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Select a section below to manage content across your website. Each section contains specific tools to update and publish new content. This website is intended to be used on a desktop device. 
          </p>
        </div>

        {/* Content Section Cards */}
        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contentSections.map((section) => (
            <ContentSection
              key={section.title}
              title={section.title}
              description={section.description}
              href={section.href}
              icon={section.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}