"use client";

import { useEffect, useState } from "react";

type Episode = {
  id: string;
  seriesId: string;
  title: string;
  durationSec: number;
  imageUrlEp: string;
  mediaPath: string;
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

  // ✅ edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOriginal, setEditingOriginal] = useState<Episode | null>(null);

  const load = async () => {
    const eps = await fetch("/api/episodes", { credentials: "include" }).then((r) =>
      r.json()
    );
    const ser = await fetch("/api/series", { credentials: "include" }).then((r) =>
      r.json()
    );
    setEpisodes(eps);
    setSeries(ser);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setSeriesId("");
    setTitle("");
    setDurationSec("");
    setImageUrlEp("");
    setMediaPath("");
    setEditingId(null);
    setEditingOriginal(null);
  };

  const onEdit = (ep: Episode) => {
    setEditingId(ep.id);
    setEditingOriginal(ep);

    setSeriesId(ep.seriesId ?? "");
    setTitle(ep.title ?? "");
    setDurationSec(String(ep.durationSec ?? ""));
    setImageUrlEp(ep.imageUrlEp ?? "");
    setMediaPath(ep.mediaPath ?? "");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    // CREATE: moraju sva polja
    if (!editingId) {
      if (!seriesId || !title || !durationSec || !imageUrlEp || !mediaPath) {
        alert("Popunite sva polja");
        return;
      }

      const res = await fetch("/api/episodes", {
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Greška pri čuvanju");
        return;
      }

      resetForm();
      await load();
      return;
    }

    // EDIT: možeš menjati delimično (merge sa originalnim)
    const base = editingOriginal;
    if (!base) {
      alert("Greška: nema originalnih podataka za izmenu.");
      return;
    }

    const merged = {
      seriesId: seriesId || base.seriesId,
      title: title || base.title,
      durationSec: durationSec ? Number(durationSec) : base.durationSec,
      imageUrlEp: imageUrlEp || base.imageUrlEp,
      mediaPath: mediaPath || base.mediaPath,
    };

    const res = await fetch(`/api/episodes/${editingId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(merged),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Greška pri izmeni");
      return;
    }

    resetForm();
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Obrisati epizodu?")) return;

    const res = await fetch(`/api/episodes/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Greška pri brisanju");
      return;
    }

    if (editingId === id) resetForm();
    await load();
  };

  return (
    <section className="space-y-12">
      <h1 className="text-2xl font-bold">Upravljanje epizodama</h1>

      <div className="bg-white p-6 rounded-2xl shadow space-y-4 max-w-xl">
        <select
          className="w-full rounded-xl border px-4 py-3"
          value={seriesId}
          onChange={(e) => setSeriesId(e.target.value)}
        >
          <option value="">Izaberite serijal</option>
          {series.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
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

        <button
          onClick={submit}
          className="w-full rounded-xl bg-stone-800 hover:bg-stone-700 transition text-white py-3 font-medium"
        >
          {editingId ? "Sačuvaj izmene" : "Sačuvaj"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="w-full rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 transition py-3 font-medium"
          >
            Otkaži izmenu
          </button>
        )}
      </div>

      <table className="w-full bg-white rounded-xl shadow overflow-hidden">
        <thead>
          <tr className="border-b bg-stone-50">
            <th className="p-4 text-left">Naziv</th>
            <th className="p-4 text-center">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {episodes.map((e) => (
            <tr key={e.id} className="border-b last:border-b-0">
              <td className="p-4 font-medium">{e.title}</td>
              <td className="p-4">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => onEdit(e)}
                    className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-100 transition text-stone-800"
                  >
                    Izmeni
                  </button>

                  <button
                    onClick={() => remove(e.id)}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition text-white"
                  >
                    Obriši
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {episodes.length === 0 && (
            <tr>
              <td className="p-6 text-center text-zinc-500" colSpan={2}>
                Nema epizoda u bazi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
