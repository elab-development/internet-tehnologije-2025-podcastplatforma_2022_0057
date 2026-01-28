"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import AdminNavbar from "@/components/AdminNavbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== "ADMIN") {
      router.push("/app/series");
    }
  }, [user, loading, router]);

  if (loading || user?.role !== "ADMIN") return null;

  return (
    <>
      <AdminNavbar />
      <main className="p-8 max-w-7xl mx-auto">{children}</main>
    </>
  );
}
