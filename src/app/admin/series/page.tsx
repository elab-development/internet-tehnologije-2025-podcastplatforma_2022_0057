"use client";

import { useEffect, useState } from "react";

type Series = {
  id: string;
  title: string;
  description: string;
};

type SeriesType = {
  id: string;
  name: string;
};

export default function AdminSeriesPage() {
  const [items, setItems] = useState<Series[]>([]);
  const [types, setTypes] = useState<SeriesType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrlSer, setImageUrlSer] = useState("");
  const [typeId, setTypeId] = useState("");

  const load = async () => {
    const s = await fetch("/api/series").then(r => r.json());
    const t = await fetch("/api/series-types").then(r => r.json());
    setItems(s);
    setTypes(t);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await fetch("/api/series", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        imageUrlSer,
        typeId,
        totalDurationSec: 0,
        episodesCount: 0,
      }),
    });
    setTitle("");
    setDescription("");
    setImageUrlSer("");
    setTypeId("");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati serijal?")) return;
    await fetch(`/api/series/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    load();
  };

  return (
    <section className="space-y-12">
      <h1 className="text-2xl font-bold">Upravljanje serijalima</h1>

      {/* ➕ FORMA */}
      <div className="bg-white p-6 rounded-2xl shadow space-y-4 max-w-xl">
        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Naziv"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Opis"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="URL slike serijala"
          value={imageUrlSer}
          onChange={(e) => setImageUrlSer(e.target.value)}
        />

        <select
          className="w-full rounded-xl border px-4 py-3"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
        >
          <option value="">Izaberite tip serijala</option>
          {types.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <button onClick={submit} className="w-full rounded-xl bg-stone-800 text-white py-3">
          Sačuvaj
        </button>
      </div>

      {/* 📋 TABELA */}
      <table className="w-full bg-white rounded-xl shadow">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Naziv</th>
            <th className="p-4 text-left">Opis</th>
            <th className="p-4">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {items.map(s => (
            <tr key={s.id} className="border-b">
              <td className="p-4">{s.title}</td>
              <td className="p-4 text-sm text-zinc-600">{s.description}</td>
              <td className="p-4 text-center">
                <button onClick={() => remove(s.id)} className="text-red-600 hover:underline">
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
