"use client";

import { useAuth } from "@/components/AuthProvider";

export default function EpisodeCard({ episode }: any) {
  const { user } = useAuth();
  const isPaid = user?.role === "PAID";

  return (
    <div className="rounded-2xl overflow-hidden shadow bg-white">
      {/* Slika */}
      <div className="h-40 bg-stone-300" />

      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2">
          {episode.title}
        </h3>

        <p className="text-zinc-600 text-sm mb-4">
          {episode.description}
        </p>

        {isPaid ? (
          <button className="w-full rounded-xl bg-stone-800 hover:bg-stone-700 transition text-white py-2">
            ▶️ Slušaj epizodu
          </button>
        ) : (
          <p className="text-sm text-zinc-500 italic text-center">
            Dostupno samo pretplaćenim korisnicima
          </p>
        )}
      </div>
    </div>
  );
}


