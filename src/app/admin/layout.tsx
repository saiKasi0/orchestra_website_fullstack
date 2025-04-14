"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="bottom-right" />
        {children}
      </div>
    </SessionProvider>
  );
}