"use client";

import Link from "next/link";
import { scan } from "react-scan"; // import this BEFORE react

if (typeof window !== "undefined") {
  scan({
    enabled: true,
  });
}

export default function ScanPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <p className="mb-4 text-lg">
        React Scan has loaded, you can now start exploring the site
      </p>
      <Link
        prefetch={false}
        href="/"
        className="text-blue-500 underline hover:text-blue-700"
      >
        Back to home
      </Link>
    </div>
  );
}
