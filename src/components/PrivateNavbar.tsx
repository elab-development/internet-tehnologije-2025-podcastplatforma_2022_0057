"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function PrivateNavbar() {
  const router = useRouter();
  const { user, logout, refresh } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  if (!user) return null;

  return (
    <>
      {showSuccess && (
        <div className="bg-green-100 text-green-800 px-6 py-3 text-sm text-center">
          Uspešno ste se odjavili sa pretplate.
        </div>
      )}

      <nav className="flex items-center justify-between px-8 py-4 border-b bg-white">
        <p className="text-zinc-700 font-medium">
          Zdravo, {user.firstName} {user.lastName}
        </p>

        <div className="flex items-center gap-6">
          <Link href="/app/series">Serijali</Link>

          {user.role === "USER" && (
            <Link href="/app/subscription">Pretplata</Link>
          )}

          {user.role === "PAID" && (
            <button
  onClick={async () => {
    await fetch("/api/subscription/cancel", {
      method: "POST",
      credentials: "include",
    });

    await refresh();        
    setShowSuccess(true);   

    setTimeout(() => {
      setShowSuccess(false); 
    }, 5000);

    router.push("/app/series");
  }}
  className="text-red-600 hover:text-red-700"
>
  Odustani od pretplate
</button>
          )}

          <button onClick={logout}>Odjavi se</button>
        </div>
      </nav>
    </>
  );
}

