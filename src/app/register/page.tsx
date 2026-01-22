"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/PublicNavbar";
import { useAuth } from "@/components/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        birthDate,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Greška pri registraciji");
      return;
    }

    await refresh();
    router.push("/app/series");
  };

  return (
    <main>
      <Navbar />

      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="w-full max-w-lg bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2 text-center">
            Kreiraj nalog
          </h1>
          <p className="text-zinc-600 text-center mb-8">
            Pridruži se podcast platformi
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              className="rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="Ime"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />

            <input
              className="rounded-xl border border-stone-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="Prezime"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <input
            className="w-full rounded-xl border border-stone-300 px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-stone-400"
            placeholder="Lozinka"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="date"
            className="w-full rounded-xl border border-stone-300 px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-stone-400"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-600 text-center mb-4">{error}</p>
          )}

          <button
            onClick={submit}
            className="w-full rounded-xl bg-stone-800 hover:bg-stone-700 transition text-stone-50 py-3 font-medium"
          >
            Registruj se
          </button>
        </div>
      </section>
    </main>
  );
}
