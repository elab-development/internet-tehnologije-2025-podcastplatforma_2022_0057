"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function PrivateNavbar() {
  const { user, refresh } = useAuth();
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
    router.push("/");
  };

  if (!user) return null;

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-[#f4efe9] border-b border-stone-200">
      <div className="text-lg">
        Zdravo, <span className="font-semibold">{user.firstName} {user.lastName}</span>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/app/subscription">Pretplata</Link>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-stone-800 text-white hover:bg-stone-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
