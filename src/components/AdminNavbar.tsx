"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function AdminNavbar() {
  const { user, logout } = useAuth();

  // ⛔ ako nema usera, ništa ne renderuj
  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    // logout već radi window.location.href = "/"
    // ovde NE RADIMO ništa više
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b bg-white">
      {/* LEVO */}
      <div className="text-sm text-zinc-700 font-medium">
        Zdravo, {user.firstName} {user.lastName} (ADMIN)
      </div>

      {/* DESNO */}
      <div className="flex items-center gap-6 text-sm">
        {/* ⚠️ ADMIN NE SME DA IDE NA /app */}
        {/* Ako baš želiš link, ostavi samo /admin */}
        <Link href="/admin/series" className="hover:text-zinc-900">
          Upravljanje serijalima
        </Link>

        <Link href="/admin/episodes" className="hover:text-zinc-900">
          Upravljanje epizodama
        </Link>

        <Link href="/admin/users" className="hover:text-zinc-900">
          Korisnici
        </Link>

        <button
          onClick={handleLogout}
          className="text-red-600 hover:text-red-700"
        >
          Odjavi se
        </button>
      </div>
    </nav>
  );
}
