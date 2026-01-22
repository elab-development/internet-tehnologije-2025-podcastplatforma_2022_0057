"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/PublicNavbar";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Greška pri prijavi");
      return;
    }

    await refresh();
    router.push("/app/series");
  };

  return (
    <main>
      <Navbar />

      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2 text-center">
            Dobrodošli nazad
          </h1>
          <p className="text-zinc-600 text-center mb-8">
            Prijavite se na svoj nalog
          </p>

          <div className="space-y-5">
            <input
              className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="Lozinka"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}

            <button
              onClick={submit}
              className="w-full rounded-xl bg-stone-800 hover:bg-stone-700 transition text-stone-50 py-3 font-medium"
            >
              Prijavi se
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
