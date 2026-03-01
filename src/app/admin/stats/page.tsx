"use client";

import { useEffect, useMemo, useState } from "react";
import { Chart } from "react-google-charts";

type Series = {
  id: string;
  title: string;
  typeName?: string;
  episodesCount: number;
  totalDurationSec: number;
};

type SeriesType = {
  id: string;
  name: string;
};

type Episode = {
  id: string;
  seriesId: string;
  durationSec: number;
};

type User = {
  id: string;
  role: "USER" | "PAID" | "ADMIN";
};

function StatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="text-sm text-zinc-500">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      {hint && <div className="text-xs text-zinc-400 mt-2">{hint}</div>}
    </div>
  );
}

export default function StatsPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [types, setTypes] = useState<SeriesType[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");

      try {
        const [sRes, tRes, eRes, uRes] = await Promise.all([
          fetch("/api/series?limit=200", { credentials: "include" }),
          fetch("/api/series-types", { credentials: "include" }),
          fetch("/api/episodes", { credentials: "include" }),
          fetch("/api/users", { credentials: "include" }),
        ]);

        if (!sRes.ok) throw new Error("Ne mogu da učitam /api/series");
        if (!tRes.ok) throw new Error("Ne mogu da učitam /api/series-types");
        if (!eRes.ok) throw new Error("Ne mogu da učitam /api/episodes");
        if (!uRes.ok)
          throw new Error(
            "Ne mogu da učitam /api/users (proveri da li ruta postoji i da li si ADMIN)"
          );

        setSeries(await sRes.json());
        setTypes(await tRes.json());
        setEpisodes(await eRes.json());
        setUsers(await uRes.json());
      } catch (e: any) {
        setErr(e?.message || "Greška pri učitavanju statistike");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  
  const summary = useMemo(() => {
    const seriesCount = series.length;
    const episodesCount = episodes.length; 
    const usersCount = users.length;

    const paidCount = users.filter((u) => u.role === "PAID").length;

    
    const totalSec = series.reduce(
      (acc, s) => acc + Number(s.totalDurationSec ?? 0),
      0
    );
    const totalMin = Math.round((totalSec / 60) * 10) / 10;

    return { seriesCount, episodesCount, usersCount, paidCount, totalMin };
  }, [series, episodes, users]);

  
  const pieSeriesByType = useMemo(() => {
    const data: any[] = [["Tip serijala", "Broj serijala"]];
    const counts = new Map<string, number>();

    for (const s of series) {
      const name = s.typeName ?? "Nepoznato";
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    for (const [name, cnt] of counts.entries()) data.push([name, cnt]);

    if (data.length === 1) data.push(["Nema podataka", 1]);
    return data;
  }, [series]);

  
  const usersByRole = useMemo(() => {
    const data: any[] = [["Uloga", "Broj korisnika"]];
    const counts = new Map<string, number>();

    for (const u of users) counts.set(u.role, (counts.get(u.role) ?? 0) + 1);

    const roles: Array<User["role"]> = ["USER", "PAID", "ADMIN"];
    for (const r of roles) data.push([r, counts.get(r) ?? 0]);

    if (users.length === 0) data.push(["Nema podataka", 1]);
    return data;
  }, [users]);

  
  const topSeriesByEpisodesCount = useMemo(() => {
    const sorted = [...series]
      .sort((a, b) => Number(b.episodesCount ?? 0) - Number(a.episodesCount ?? 0))
      .slice(0, 10);

    const data: any[] = [["Serijal", "Epizode"]];
    for (const s of sorted) data.push([s.title ?? s.id, Number(s.episodesCount ?? 0)]);

    if (data.length === 1) data.push(["Nema podataka", 0]);
    return data;
  }, [series]);

  
  const topSeriesByDurationMin = useMemo(() => {
    const sorted = [...series]
      .sort(
        (a, b) =>
          Number(b.totalDurationSec ?? 0) - Number(a.totalDurationSec ?? 0)
      )
      .slice(0, 10);

    const data: any[] = [["Serijal", "Trajanje (min)"]];
    for (const s of sorted) {
      const minutes =
        Math.round((Number(s.totalDurationSec ?? 0) / 60) * 10) / 10;
      data.push([s.title ?? s.id, minutes]);
    }

    if (data.length === 1) data.push(["Nema podataka", 0]);
    return data;
  }, [series]);

  if (loading) return <div className="p-8">Učitavanje...</div>;
  if (err) return <div className="p-8 text-red-600">{err}</div>;

  return (
    <section className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Statistika</h1>

      {/* KARTICE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Ukupno serijala" value={`${summary.seriesCount}`} />
        <StatCard title="Ukupno epizoda" value={`${summary.episodesCount}`} />
        <StatCard title="Ukupno korisnika" value={`${summary.usersCount}`} />
        <StatCard
          title="Premium korisnici"
          value={`${summary.paidCount}`}
          
        />
        <div className="sm:col-span-2 lg:col-span-4">
          <StatCard
            title="Ukupno trajanje sadržaja"
            value={`${summary.totalMin} min`}
            
          />
        </div>
      </div>

      {/* GRAFICI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Broj serijala po tipu</h2>
          <Chart
            chartType="PieChart"
            data={pieSeriesByType}
            width="100%"
            height="360px"
            options={{ legend: { position: "right" }, pieHole: 0.35 }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Korisnici po ulozi</h2>
          <Chart
            chartType="PieChart"
            data={usersByRole}
            width="100%"
            height="360px"
            options={{ legend: { position: "right" }, pieHole: 0.35 }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">
            Top serijali po broju epizoda
          </h2>
          <Chart
            chartType="ColumnChart"
            data={topSeriesByEpisodesCount}
            width="100%"
            height="360px"
            options={{
              legend: { position: "none" },
              hAxis: { slantedText: true, slantedTextAngle: 35 },
              vAxis: { minValue: 0 },
            }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">
            Top serijali po ukupnom trajanju (min)
          </h2>
          <Chart
            chartType="BarChart"
            data={topSeriesByDurationMin}
            width="100%"
            height="420px"
            options={{
              legend: { position: "none" },
              bars: "horizontal",
              vAxis: { textStyle: { fontSize: 12 } },
              hAxis: { minValue: 0 },
            }}
          />
        </div>
      </div>
    </section>
  );
}