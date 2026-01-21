import { Episode } from "@/mock/data";

type Props = {
  episode: Episode;
};



export default function EpisodeCard({ episode }: Props) {
  return (
    <div className="bg-stone-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="h-44 overflow-hidden">
        <img
          src={episode.image}
          alt={episode.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-zinc-900">
          {episode.title}
        </h3>
        <p className="text-sm text-zinc-600">
          {episode.description}
        </p>
      </div>
    </div>
  );
}
