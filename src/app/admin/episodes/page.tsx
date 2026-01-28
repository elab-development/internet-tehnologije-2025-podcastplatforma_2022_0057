"use client";

import { useEffect, useState } from "react";

type Episode = {
  id: string;
  title: string;
};

type Series = {
  id: string;
  title: string;
};

export default function AdminEpisodesPage() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [series, setSeries] = useState<Series[]>([]);
  const [seriesId, setSeriesId] = useState("");
  const [title, setTitle] = useState("");
  const [durationSec, setDurationSec] = useState("");
  const [imageUrlEp, setImageUrlEp] = useState("");
  const [mediaPath, setMediaPath] = useState("");

  const load = async () => {
    setEpisodes(await fetch("/api/episodes").then(r => r.json()));
    setSeries(await fetch("/api/series").then(r => r.json()));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await fetch("/api/episodes", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesId,
        title,
        durationSec: Number(durationSec),
        imageUrlEp,
        mediaPath,
      }),
    });
    setTitle("");
    setDurationSec("");
    setImageUrlEp("");
    setMediaPath("");
    setSeriesId("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati epizodu?")) return;
    await fetch(`/api/episodes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    load();
  };

  return (
    <section className="space-y-12">
      <h1 className="text-2xl font-bold">Upravljanje epizodama</h1>

      {/* ➕ FORMA */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4 max-w-xl">
        <select
          className="w-full rounded-xl border px-4 py-3"
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
        >
          <option value="">Izaberite serijal</option>
          {series.map(s => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>

        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Naziv epizode"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Trajanje (sekunde)"
          value={durationSec}
          onChange={(e) => setDurationSec(e.target.value)}
        />

        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="URL slike epizode"
          value={imageUrlEp}
          onChange={(e) => setImageUrlEp(e.target.value)}
        />

        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Media path (Spotify / MP3)"
          value={mediaPath}
          onChange={(e) => setMediaPath(e.target.value)}
        />

        <button onClick={submit} className="w-full rounded-xl bg-stone-800 text-white py-3">
          Sačuvaj
        </button>
      </div>

      {/* 📋 TABELA */}
      <table className="w-full bg-white rounded-xl shadow">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Naziv</th>
            <th className="p-4">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {episodes.map(e => (
            <tr key={e.id} className="border-b">
              <td className="p-4">{e.title}</td>
              <td className="p-4 text-center">
                <button onClick={() => remove(e.id)} className="text-red-600 hover:underline">
                  Obriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
