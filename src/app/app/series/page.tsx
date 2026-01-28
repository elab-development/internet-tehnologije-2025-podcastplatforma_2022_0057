"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SeriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/series")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  return (
    <section className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Podcast serijali</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((s) => (
          <div
            key={s.id}
            onClick={() => router.push(`/app/series/${s.id}`)}
            className="cursor-pointer rounded-2xl bg-white shadow hover:shadow-lg transition p-5"
          >
            <img
              src={s.imageUrlSer || "/placeholder.jpg"}
              alt={s.title}
              className="h-40 w-full object-cover rounded-xl mb-4"
            />

            <h2 className="text-lg font-semibold mb-2">{s.title}</h2>
            <p className="text-zinc-600 text-sm">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
