"use client";

import { useEffect, useState } from "react";

type Episode = {
  id: string;
  seriesId: string;
  title: string;
  durationSec: number;
  imageUrlEp: string; // npr "/uploads/xxx.jpg"
  mediaPath: string;  // npr "/uploads/yyy.mp3"
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

  // upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [audioName, setAudioName] = useState("");

  // edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOriginal, setEditingOriginal] = useState<Episode | null>(null);

  const load = async () => {
    const eps = await fetch("/api/episodes", { credentials: "include" }).then((r) => r.json());
    const ser = await fetch("/api/series", { credentials: "include" }).then((r) => r.json());
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

    setImageFile(null);
    setAudioFile(null);
    setImageName("");
    setAudioName("");

    setEditingId(null);
    setEditingOriginal(null);

    const img = document.getElementById("epImage") as HTMLInputElement | null;
    const aud = document.getElementById("epAudio") as HTMLInputElement | null;
    if (img) img.value = "";
    if (aud) aud.value = "";
  };

  const onEdit = (e: Episode) => {
    setEditingId(e.id);
    setEditingOriginal(e);

    setSeriesId(e.seriesId);
    setTitle(e.title ?? "");
    setDurationSec(String(e.durationSec ?? ""));

    // ne biramo automatski fajlove u file input
    setImageFile(null);
    setAudioFile(null);
    setImageName("");
    setAudioName("");

    const img = document.getElementById("epImage") as HTMLInputElement | null;
    const aud = document.getElementById("epAudio") as HTMLInputElement | null;
    if (img) img.value = "";
    if (aud) aud.value = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    // CREATE: mora sve
    if (!editingId) {
      if (!seriesId || !title.trim() || !durationSec || !imageFile || !audioFile) {
        alert("Popunite sva polja i izaberite sliku + audio fajl.");
        return;
      }

      const form = new FormData();
      form.append("seriesId", seriesId);
      form.append("title", title.trim());
      form.append("durationSec", String(Number(durationSec)));
      form.append("image", imageFile);
      form.append("audio", audioFile);

      const res = await fetch("/api/episodes", {
        method: "POST",
        credentials: "include",
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Greška pri čuvanju epizode");
        return;
      }

      resetForm();
      await load();
      return;
    }

    // EDIT: može delimično, fajlovi su opciono
    const base = editingOriginal;
    if (!base) {
      alert("Greška: nema originalne epizode.");
      return;
    }

    const form = new FormData();

    // serijal i trajanje možeš da menjaš – ali ne šalji prazno
    if (seriesId && seriesId !== base.seriesId) form.append("seriesId", seriesId);

    const t = title.trim();
    if (t && t !== base.title) form.append("title", t);

    if (durationSec !== "" && Number(durationSec) !== base.durationSec) {
      form.append("durationSec", String(Number(durationSec)));
    }

    // fajlovi samo ako su izabrani novi
    if (imageFile) form.append("image", imageFile);
    if (audioFile) form.append("audio", audioFile);

    if (
      !form.has("seriesId") &&
      !form.has("title") &&
      !form.has("durationSec") &&
      !form.has("image") &&
      !form.has("audio")
    ) {
      alert("Niste uneli nijednu izmenu.");
      return;
    }

    const res = await fetch(`/api/episodes/${editingId}`, {
      method: "PUT",
      credentials: "include",
      body: form,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Greška pri izmeni epizode");
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
      alert(data.error || "Greška pri brisanju epizode");
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

        {/* Upload slike */}
        <div className="w-full">
          <input
            id="epImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setImageFile(f);
              setImageName(f ? f.name : "");
            }}
          />
          <div className="flex items-center gap-3 rounded-xl border px-4 py-3 bg-white">
            <label
              htmlFor="epImage"
              className="cursor-pointer rounded-lg bg-stone-800 hover:bg-stone-700 transition text-white px-4 py-2 text-sm font-medium"
            >
              Izaberi sliku
            </label>
            <span className="text-sm text-zinc-600 truncate">
              {imageName ||
                (editingId ? "Slika je već sačuvana (opciono promeni)" : "Nijedna slika nije izabrana")}
            </span>
          </div>
        </div>

        {/* Upload audio */}
        <div className="w-full">
          <input
            id="epAudio"
            type="file"
            accept="audio/*,.mp3,.wav,.m4a"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setAudioFile(f);
              setAudioName(f ? f.name : "");
            }}
          />
          <div className="flex items-center gap-3 rounded-xl border px-4 py-3 bg-white">
            <label
              htmlFor="epAudio"
              className="cursor-pointer rounded-lg bg-stone-800 hover:bg-stone-700 transition text-white px-4 py-2 text-sm font-medium"
            >
              Izaberi audio fajl
            </label>
            <span className="text-sm text-zinc-600 truncate">
              {audioName ||
                (editingId ? "Audio je već sačuvan (opciono promeni)" : "Nijedan audio fajl nije izabran")}
            </span>
          </div>
        </div>

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
              <td className="p-4">{e.title}</td>
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