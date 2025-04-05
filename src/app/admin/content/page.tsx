import { Metadata } from "next";
import Link from "next/link";
import { 
  Trophy, 
  Music, 
  Plane, 
  Award,
} from "lucide-react";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";

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

export default function ContentManagementPage() {
  return (
    <AdminPageLayout allowedRoles={["admin", "content_editor", "super_admin"]} title="Content Management">
      <div className="space-y-6">
        <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-start">
          <div className="container mx-auto flex max-w-5xl flex-col items-center px-4 py-8">
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
      </div>
    </AdminPageLayout>
  );
}

const contentSections: ContentSectionProps[] = [
  {
    title: "Homepage",
    description: "Update the hero section, featured events, and other elements on the homepage.",
    href: "/admin/content/homepage",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
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
    description: "Update the orchestra calendar and support videos on the resources page.",
    href: "/admin/content/resources",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="M9 9h6v6H9z" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L9 18" />
        <circle cx="7.5" cy="7.5" r="1.5" />
      </svg>
    )
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