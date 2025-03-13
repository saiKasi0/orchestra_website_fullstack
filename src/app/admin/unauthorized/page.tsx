"use client";

import { Button } from "@/components/ui/button";
import { Shield, Home } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <div className="inline-flex p-3 bg-red-100 rounded-full">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You don&apos;t have permission to access this page. Please contact an administrator
            if you believe this is a mistake.
          </p>
          
          <div className="mt-6">
            <Button asChild>
              <Link href="/admin/dashboard" className="inline-flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}