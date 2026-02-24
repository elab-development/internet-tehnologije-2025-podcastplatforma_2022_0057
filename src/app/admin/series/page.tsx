"use client";

import { useEffect, useState } from "react";

type Series = {
  id: string;
  title: string;
  description: string;
  imageUrlSer: string;
  typeId: string;
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
  const [typeId, setTypeId] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOriginal, setEditingOriginal] = useState<Series | null>(null);

  const load = async () => {
    const s = await fetch("/api/series", { credentials: "include" }).then((r) =>
      r.json()
    );
    const t = await fetch("/api/series-types", {
      credentials: "include",
    }).then((r) => r.json());

    setItems(s);
    setTypes(t);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTypeId("");
    setImageFile(null);
    setFileName("");
    setEditingId(null);
    setEditingOriginal(null);

    // reset file input (da se obriše selected file u UI)
    const el = document.getElementById("seriesImage") as HTMLInputElement | null;
    if (el) el.value = "";
  };

  const onEdit = (s: Series) => {
    setEditingId(s.id);
    setEditingOriginal(s);

    setTitle(s.title ?? "");
    setDescription(s.description ?? "");
    setTypeId(s.typeId ?? "");

    setImageFile(null);
    setFileName("");

    const el = document.getElementById("seriesImage") as HTMLInputElement | null;
    if (el) el.value = "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    // ✅ CREATE: mora sve + slika
    if (!editingId) {
      if (!title.trim() || !description.trim() || !typeId || !imageFile) {
        alert("Popunite sva polja i izaberite sliku.");
        return;
      }

      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("typeId", typeId);
      form.append("image", imageFile);

      const res = await fetch("/api/series", {
        method: "POST",
        credentials: "include",
        body: form,
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

    // ✅ EDIT: šalji samo ono što ima smisla (bez praznih)
    const base = editingOriginal;
    if (!base) {
      alert("Greška: nema originalnog serijala.");
      return;
    }

    const form = new FormData();

    // title/description: ako su prazni -> ne šalji, backend neka zadrži staro
    const t = title.trim();
    const d = description.trim();

    if (t && t !== base.title) form.append("title", t);
    if (d && d !== base.description) form.append("description", d);

    // typeId: ako user nije izabrao ništa (""), NEMOJ slati
    // i ako je ostao isti, ne moraš slati
    if (typeId && typeId !== base.typeId) form.append("typeId", typeId);

    // slika: samo ako je izabrana nova
    if (imageFile) form.append("image", imageFile);

    // ako baš ništa nije promenjeno
    if (
      !form.has("title") &&
      !form.has("description") &&
      !form.has("typeId") &&
      !form.has("image")
    ) {
      alert("Niste uneli nijednu izmenu.");
      return;
    }

    const res = await fetch(`/api/series/${editingId}`, {
      method: "PUT",
      credentials: "include",
      body: form,
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
    if (!confirm("Obrisati serijal?")) return;

    const res = await fetch(`/api/series/${id}`, {
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
      <h1 className="text-2xl font-bold">Upravljanje serijalima</h1>

      <div className="bg-white p-6 rounded-2xl shadow space-y-4 max-w-xl">
        <input
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Naziv serijala"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full rounded-xl border px-4 py-3"
          placeholder="Opis serijala"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* CUSTOM UPLOAD */}
        <div className="w-full">
          <input
            id="seriesImage"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setImageFile(f);
              setFileName(f ? f.name : "");
            }}
          />

          <div className="flex items-center gap-3 rounded-xl border px-4 py-3 bg-white">
            <label
              htmlFor="seriesImage"
              className="cursor-pointer rounded-lg bg-stone-800 hover:bg-stone-700 transition text-white px-4 py-2 text-sm font-medium"
            >
              Izaberi sliku
            </label>

            <span className="text-sm text-zinc-600 truncate">
              {fileName ||
                (editingId
                  ? "Slika je već sačuvana (opciono promeni)"
                  : "Nijedna slika nije izabrana")}
            </span>
          </div>
        </div>

        <select
          className="w-full rounded-xl border px-4 py-3"
          value={typeId}
          onChange={(e) => setTypeId(e.target.value)}
        >
          <option value="">Izaberite tip serijala</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

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
            <th className="p-4 text-left">Opis</th>
            <th className="p-4 text-center">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr key={s.id} className="border-b last:border-b-0">
              <td className="p-4 font-medium">{s.title}</td>
              <td className="p-4 text-sm text-zinc-600">{s.description}</td>
              <td className="p-4">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => onEdit(s)}
                    className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-100 transition text-stone-800"
                  >
                    Izmeni
                  </button>

                  <button
                    onClick={() => remove(s.id)}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition text-white"
                  >
                    Obriši
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td className="p-6 text-center text-zinc-500" colSpan={3}>
                Nema serijala u bazi.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}