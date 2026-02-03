"use client";

import { useAuth } from "@/components/AuthProvider";
import PrivateNavbar from "@/components/PrivateNavbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <>
      
      {user?.role !== "ADMIN" && <PrivateNavbar />}
      <main>{children}</main>
    </>
  );
}
