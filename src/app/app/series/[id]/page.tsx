"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Episode = {
  id: string;
  title: string;
  durationSec: number;
  imageUrlEp: string | null;
};

export default function SeriesEpisodesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [forbidden, setForbidden] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setForbidden(false);

      const res = await fetch(`/api/series/${id}/episodes`, {
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.status === 403) {
        setForbidden(true);
        setEpisodes([]);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        console.error("API error:", res.status);
        setLoading(false);
        return;
      }

      const data = (await res.json()) as Episode[];
      setEpisodes(data);
      setLoading(false);
    };

    load();
  }, [id, router]);

  if (loading) {
    return <div className="p-10 text-center text-zinc-600">Učitavanje...</div>;
  }

  if (forbidden) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold mb-3">Potrebna je pretplata</h2>
        <p className="text-zinc-600 mb-6">
          Pretplatite se da biste videli epizode.
        </p>

        <button
          onClick={() => router.push("/app/subscription")}
          className="rounded-xl bg-stone-800 text-white px-6 py-3"
        >
          Pretplati se
        </button>
      </div>
    );
  }

  return (
    <section className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Epizode</h1>

      {episodes.length === 0 ? (
        <p className="text-zinc-600">Nema epizoda za ovaj serijal.</p>
      ) : (
        <div className="space-y-4">
          {episodes.map((ep) => (
            <div
              key={ep.id}
              className="rounded-2xl bg-white shadow p-5 flex gap-5 items-center"
            >
              {/* SLIKA EPIZODE */}
              {ep.imageUrlEp ? (
                <img
                  src={ep.imageUrlEp}
                  alt={ep.title}
                  className="w-28 h-20 rounded-xl object-cover bg-stone-200"
                />
              ) : (
                <div className="w-28 h-20 rounded-xl bg-stone-200" />
              )}

              {/* INFO */}
              <div className="flex-1">
                <div className="font-medium">{ep.title}</div>
                <div className="text-sm text-zinc-600">
                  Trajanje: {ep.durationSec}s
                </div>
              </div>

              {/* AKCIJA */}
              <button className="rounded-xl bg-stone-800 text-white px-4 py-2">
                ▶️ Slušaj
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
