"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SeriesEpisodesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [episodes, setEpisodes] = useState<any[]>([]);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
  const load = async () => {
    const res = await fetch(`/api/series/${id}/episodes`);

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (res.status === 403) {
      setForbidden(true);
      return;
    }

    if (!res.ok) {
      const text = await res.text();
      console.error("API error:", res.status, text);
      return;
    }

    // ✅ bezbedno parsiranje
    const text = await res.text();
    if (!text) {
      setEpisodes([]); // prazno
      return;
    }

    setEpisodes(JSON.parse(text));
  };

  load();
}, [id]);


  if (forbidden) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold mb-3">Potrebna je pretplata</h2>
        <p className="text-zinc-600 mb-6">Pretplatite se da biste videli epizode.</p>
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

      <div className="space-y-4">
        {episodes.map((ep) => (
          <div key={ep.id} className="rounded-xl bg-white shadow p-5 flex justify-between">
            <div>
              <div className="font-medium">{ep.title}</div>
              <div className="text-sm text-zinc-600">Trajanje: {ep.durationSec}s</div>
            </div>
            <button className="rounded-xl bg-stone-800 text-white px-4 py-2">
              ▶️ Slušaj
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

