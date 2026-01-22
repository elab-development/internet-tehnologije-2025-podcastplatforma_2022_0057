"use client";

import { useRouter } from "next/navigation";
import { series } from "@/mock/data";

export default function SeriesPage() {
  const router = useRouter();

  return (
    <section className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Podcast serijali
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {series.map((s) => (
          <div
            key={s.id}
            onClick={() => router.push(`/app/series/${s.id}`)}
            className="cursor-pointer rounded-2xl bg-white shadow hover:shadow-lg transition p-5"
          >
            <div className="h-40 bg-stone-200 rounded-xl mb-4" />

            <h2 className="text-lg font-semibold mb-2">
              {s.title}
            </h2>

            <p className="text-zinc-600 text-sm">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
