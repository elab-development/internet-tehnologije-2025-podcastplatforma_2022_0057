"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function SubscriptionPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [part3, setPart3] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");

    const accountNumber = `${part1}-${part2}-${part3}`;
    const accountRegex = /^\d{3}-\d{1,13}-\d{2}$/;

    if (!accountRegex.test(accountNumber)) {
      setError("Unesite ispravan format broja računa");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountNumber }),
      });

      if (!res.ok) {
        setError("Greška pri pretplati");
        return;
      }

      setSuccess(true);

      
      await refresh();

      
      setTimeout(() => {
        router.push("/app/series");
      }, 1200);
    } finally {
      setLoading(false);
    }
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
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                placeholder="___"
                className="w-20 text-center rounded-xl border border-stone-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400"
                value={part1}
                onChange={(e) =>
                  setPart1(e.target.value.replace(/\D/g, ""))
                }
              />

              <span className="self-center text-stone-500">-</span>

              <input
                type="text"
                inputMode="numeric"
                maxLength={13}
                placeholder="______"
                className="flex-1 text-center rounded-xl border border-stone-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400"
                value={part2}
                onChange={(e) =>
                  setPart2(e.target.value.replace(/\D/g, ""))
                }
              />

              <span className="self-center text-stone-500">-</span>

              <input
                type="text"
                inputMode="numeric"
                maxLength={2}
                placeholder="__"
                className="w-16 text-center rounded-xl border border-stone-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-stone-400"
                value={part3}
                onChange={(e) =>
                  setPart3(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center mb-4">
                {error}
              </p>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full rounded-xl bg-stone-800 hover:bg-stone-700 transition text-white py-3 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Obrada..." : "Pretplati se"}
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
              Preusmeravamo vas na serijale...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
