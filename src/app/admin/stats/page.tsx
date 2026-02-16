"use client";

import { useEffect, useMemo, useState } from "react";
import { Chart } from "react-google-charts";

type Series = {
  id: string;
  typeId: string;
};

type SeriesType = {
  id: string;
  name: string;
};

export default function StatsPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [types, setTypes] = useState<SeriesType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const s = await fetch("/api/series", { credentials: "include" }).then((r) => r.json());
      const t = await fetch("/api/series-types", { credentials: "include" }).then((r) => r.json());
      setSeries(s);
      setTypes(t);
      setLoading(false);
    };
    load();
  }, []);

  const pieData = useMemo(() => {
    // header
    const data: any[] = [["Tip serijala", "Broj serijala"]];

    const nameById = new Map(types.map((x) => [x.id, x.name]));
    const counts = new Map<string, number>();

    for (const s of series) {
      counts.set(s.typeId, (counts.get(s.typeId) ?? 0) + 1);
    }

    for (const [typeId, cnt] of counts.entries()) {
      data.push([nameById.get(typeId) ?? "Nepoznato", cnt]);
    }

    // ako nema ničega
    if (data.length === 1) data.push(["Nema podataka", 1]);

    return data;
  }, [series, types]);

  if (loading) return <div className="p-8">Učitavanje...</div>;

  return (
    <section className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Statistika</h1>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Broj serijala po tipu</h2>

        <Chart
          chartType="PieChart"
          data={pieData}
          width="100%"
          height="360px"
          options={{
            legend: { position: "right" },
            pieHole: 0.35, // donut stil, lepše izgleda
          }}
        />
      </div>
    </section>
  );
}
