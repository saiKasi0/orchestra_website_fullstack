"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Handle successful upload
      router.refresh(); // Refresh the page/component if needed
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <label className="block">
        <span className="sr-only">Choose file</span>
        <input
          type="file"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          onChange={handleUpload}
          disabled={isUploading}
          accept="image/jpeg,image/png,image/gif"
        />
      </label>

      {isUploading && (
        <div className="mt-2 text-sm text-blue-600">Uploading...</div>
      )}

      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
    </div>
  );
}
