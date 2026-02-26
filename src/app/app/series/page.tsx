"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type SeriesType = {
  id: string;
  name: string;
};

type Series = {
  id: string;
  title: string;
  description: string;
  imageUrlSer: string;
  totalDurationSec: number;
  episodesCount: number;
  typeName: string;
};

export default function SeriesPage() {
  const [items, setItems] = useState<Series[]>([]);
  const [types, setTypes] = useState<SeriesType[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);

  const limit = 6;
  const router = useRouter();

  useEffect(() => {
    fetch("/api/series-types")
      .then((r) => r.json())
      .then(setTypes);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      q: query,
      type,
      page: String(page),
      limit: String(limit),
    });

    fetch(`/api/series?${params.toString()}`)
      .then((r) => r.json())
      .then(setItems);
  }, [query, type, page]);

  return (
    <section className="min-h-screen bg-[#f6f1eb] px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-8">
          Podcast serijali
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <input
            placeholder="Pretraga po nazivu..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="border px-4 py-2 rounded-xl w-full sm:w-1/2"
          />

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="border px-4 py-2 rounded-xl w-full sm:w-1/4"
          >
            <option value="">Svi tipovi</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((s) => (
            <div
              key={s.id}
              onClick={() => router.push(`/app/series/${s.id}`)}
              className="cursor-pointer bg-[#fffaf4] rounded-3xl p-6 shadow hover:shadow-lg transition border border-[#e7ded4]"
            >
              <img
                src={
                  s.imageUrlSer
                    ? `/api/files/images${s.imageUrlSer}`
                    : "/placeholder.jpg"
                }
                className="h-40 w-full object-cover rounded-xl mb-4"
              />

              <p className="text-xs uppercase text-[#8b6b4f] mb-1">
                {s.typeName}
              </p>

              <h2 className="text-xl font-serif font-semibold text-[#3f2d22] mb-2">
                {s.title}
              </h2>

              <p className="text-sm text-[#5c4a3d] mb-4 line-clamp-3">
                {s.description}
              </p>

              <div className="flex justify-between text-xs text-[#6b5848] border-t pt-3">
                <span>🎧Broj epizoda: {s.episodesCount}</span>
                <span>⏱ {s.totalDurationSec} sekundi</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-12">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl bg-stone-200 disabled:opacity-50"
          >
            Prethodna
          </button>

          <span className="px-4 py-2 font-medium">{page}</span>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-stone-200"
          >
            Sledeća
          </button>
        </div>
      </div>
    </section>
  );
}