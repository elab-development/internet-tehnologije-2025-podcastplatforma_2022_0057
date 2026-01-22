"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function SubscriptionPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [accountNumber, setAccountNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submit = async () => {
    setError("");

    if (!accountNumber) {
      setError("Molimo unesite broj računa");
      return;
    }

    // ⏳ Simulacija poziva backend-a
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Kasnije ovde ide:
    // POST /api/subscription

    setSuccess(true);

    // Osveži user stanje (kasnije će role biti PAID)
    await refresh();

    // Posle kratkog delay-a vrati na epizode
    setTimeout(() => {
      router.push("/app/episodes");
    }, 1200);
  };

  return (
    <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 bg-gradient-to-b from-stone-100 to-stone-50">
      <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4 text-center">
          Pretplata
        </h1>

        <p className="text-zinc-600 text-center mb-6">
          Pretplatite se kako biste dobili pristup svim podcastima za slušanje.
        </p>

        {!success ? (
          <>
            <input
              className="w-full rounded-xl border border-stone-300 px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="Broj računa"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />

            {error && (
              <p className="text-sm text-red-600 text-center mb-4">
                {error}
              </p>
            )}

            <button
              onClick={submit}
              className="w-full rounded-xl bg-stone-800 hover:bg-stone-700 transition text-white py-3 font-medium"
            >
              Pretplati se
            </button>

            <button
  onClick={() => router.back()}
  className="w-full mt-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 transition py-3 font-medium"
>
  Odustani
</button>
          </>
        ) : (
          <div className="text-center">
            <p className="text-green-700 font-medium mb-2">
              Uspešno ste se pretplatili!
            </p>
            <p className="text-zinc-600 text-sm">
              Preusmeravamo vas na epizode...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
