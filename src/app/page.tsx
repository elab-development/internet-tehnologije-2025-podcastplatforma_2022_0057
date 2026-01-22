import Navbar from "@/components/PublicNavbar";
import EpisodeCard from "@/components/EpisodeCard";
import { episodes } from "@/mock/data";

export default function HomePage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
 <section className="px-8 py-28 text-center bg-gradient-to-b from-stone-100 to-stone-50">
  <div className="max-w-3xl mx-auto">
    <h1 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900">
      Platforma za slušanje podcasta
    </h1>

    <p className="text-zinc-600 text-lg">
      Otkrij najzanimljivije podcaste iz različitih oblasti – sve na jednom mestu.
    </p>
  </div>
</section>



      {/* Popular episodes */}
      <section className="px-8 py-24 max-w-7xl mx-auto">
  <h2 className="text-2xl font-semibold mb-10 text-zinc-900">
    Najpopularnije epizode
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {episodes.map((ep) => (
      <EpisodeCard key={ep.id} episode={ep} />
    ))}
  </div>
</section>

    </main>
  );
}
