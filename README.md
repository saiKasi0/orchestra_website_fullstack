# Cypress Ranch High School Orchestra Website

This is a hobbyist-developed website for the Cypress Ranch High School Orchestra, built with [Next.js](https://nextjs.org), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), and [Supabase](https://supabase.io/).

## Project Overview

This full-stack application serves as the primary online presence for the orchestra. Key features include:

*   **Public-Facing Pages:** Homepage, Concerts, Awards, Trips, Resources.
*   **Dynamic Content:** Content for most pages is fetched from a Supabase database.
*   **Admin Panel:** A secure area for authorized users (admins, leadership) to manage website content (homepage details, concert schedules, resources, awards, trips, user roles).
*   **Authentication:** Uses NextAuth.js for user authentication and role-based access control.
*   **Styling:** Utilizes Tailwind CSS and Shadcn/ui components for a modern and responsive design.
*   **Animations:** Incorporates Framer Motion for smooth page transitions and interactive elements.

## Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, Shadcn/ui
*   **Database & Backend:** Supabase (PostgreSQL, Storage, Auth)
*   **Authentication:** NextAuth.js
*   **Rate Limiting/Caching:** Upstash Redis (@upstash/redis, @upstash/ratelimit)
*   **Animations:** Framer Motion
*   **State Management:** React Hooks (useState, useEffect, useCallback, useMemo)
*   **Form Handling:** React Hooks
*   **Schema Validation:** Zod
*   **UI Components:** Shadcn/ui, Lucide Icons
*   **Deployment:** Vercel

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, pnpm, or bun
*   A Supabase project set up.
*   Environment variables configured (see below).

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/saiKasi0/orchestra_website_fullstack
    cd orchestra_website_fullstack
    ```
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

### Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables obtained from your Supabase project and other services:

```env
# Next
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-at-least-32-chars-long

# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=development # or production

# Redis Connection
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Optional: Add any other required environment variables (e.g., for email providers if used with NextAuth)
```

**Important:** You will need to set up the necessary database tables and storage buckets in your Supabase project according to the application's needs (e.g., `homepage_content`, `concert_page_content`, `staff_members`, `leadership_sections`, storage buckets for images). Refer to the API routes and data fetching logic for schema details.

### Running the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The application includes an admin dashboard accessible at `/admin`. Authentication is required to access these routes.

## Admin Panel

The admin panel allows authorized users to manage various aspects of the website's content:

*   **Homepage:** Update hero section, about text, stats, featured events, staff, and leadership sections.
*   **Concerts:** Manage concert details, poster images, and performance order for different orchestra groups.
*   **Awards:** Add, edit, reorder, and delete award/achievement entries with images.
*   **Trips:** Manage trip information, gallery images, and featured details.
*   **Resources:** Update the embedded calendar URL and support video details.
*   **Users:** (Admin only) Manage user roles (admin, leadership, user).

Access is controlled via NextAuth.js and role checks within API routes and page components.

## Acknowledgements

I built this project during my time as orchestra leadership at Cypress Ranch High School, with the goal of increasing our organization's online presence and coordination.

Sincere thanks to Ms. Ledford and Ms. Sung, and the entire Cypress Ranch Orchestra Program. Go Mustangs!

## Deploy on Vercel

The easiest way to deploy a Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Important:** Ensure you configure the necessary environment variables in your Vercel project settings.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
