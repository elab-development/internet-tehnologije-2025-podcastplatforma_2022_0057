"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/"); 
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b bg-white">
      <div className="text-sm text-zinc-700 font-medium">
        Zdravo, {user.firstName} {user.lastName} (ADMIN)
      </div>

      <div className="flex items-center gap-6 text-sm">
        <Link href="/admin/series" className="hover:text-zinc-900">
          Upravljanje serijalima
        </Link>

        <Link href="/admin/episodes" className="hover:text-zinc-900">
          Upravljanje epizodama
        </Link>

        <Link href="/admin/users" className="hover:text-zinc-900">
          Korisnici
        </Link>

        
        <Link href="/admin/stats" className="hover:text-zinc-900">
          Statistika
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
