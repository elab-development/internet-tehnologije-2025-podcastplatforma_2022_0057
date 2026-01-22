"use client";

import { useParams } from "next/navigation";
import { episodes } from "@/mock/data";
import { useAuth } from "@/components/AuthProvider";

export default function SeriesEpisodesPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const filteredEpisodes = episodes.filter(
    (ep) => ep.seriesId === id
  );

  return (
    <section className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Epizode
      </h1>

      {user?.role !== "PAID" && (
        <div className="mb-6 rounded-xl bg-stone-100 p-4 text-zinc-700">
          Pretplatite se kako biste mogli da slušate epizode.
        </div>
      )}

      <div className="space-y-4">
        {filteredEpisodes.map((ep) => (
          <div
            key={ep.id}
            className="rounded-xl bg-white shadow p-5 flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium">{ep.title}</h3>
              <p className="text-sm text-zinc-600">
                Trajanje: {ep.duration} min
              </p>
            </div>

            {user?.role === "PAID" ? (
              <button className="rounded-xl bg-stone-800 text-white px-4 py-2">
                ▶️ Slušaj
              </button>
            ) : (
              <span className="text-sm text-zinc-500 italic">
                Premium
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
