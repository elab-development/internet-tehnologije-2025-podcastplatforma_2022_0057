"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-[#d6cfc7] bg-[#f4efe9]">
      <div className="max-w-7xl mx-auto px-10 py-5 flex justify-between items-center">
        <Link href="/" className="text-xl font-semibold">
          Podcastify
        </Link>

        <div className="flex gap-4">
          <Link
            href="/login"
            className="px-6 py-2 rounded-full text-sm hover:bg-[#ede4d9]"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="px-6 py-2 rounded-full bg-[#6b4f3f] text-[#f4efe9]"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}
