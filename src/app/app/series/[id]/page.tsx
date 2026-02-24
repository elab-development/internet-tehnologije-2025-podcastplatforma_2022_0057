"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Episode = {
  id: string;
  title: string;
  durationSec: number;
  imageUrlEp: string | null;
};

type Progress = {
  episodeId: string;
  positionSec: number;
  completed: boolean;
};

export default function SeriesEpisodesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedRef = useRef(0);

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (time: number) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  /* ================= LOAD EPISODES ================= */

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      const res = await fetch(`/api/series/${id}/episodes`, {
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (res.status === 403) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setEpisodes(data);
      setLoading(false);
    };

    load();
  }, [id, router]);

  /* ================= LOAD PROGRESS ================= */

  useEffect(() => {
    if (episodes.length === 0) return;

    const loadProgress = async () => {
      const map: Record<string, Progress> = {};

      for (const ep of episodes) {
        const res = await fetch(
          `/api/episodes/${ep.id}/progress`,
          { credentials: "include" }
        );

        if (!res.ok) continue;

        const data = await res.json();

        map[ep.id] = {
          episodeId: ep.id,
          positionSec: data.positionSec ?? 0,
          completed: data.completed ?? false,
        };
      }

      setProgressMap(map);
    };

    loadProgress();
  }, [episodes]);

  /* ================= RESUME ================= */

  useEffect(() => {
    if (!activeEpisode || !audioRef.current) return;

    const progress = progressMap[activeEpisode.id];

    if (progress && progress.positionSec > 0 && !progress.completed) {
      audioRef.current.currentTime = progress.positionSec;
      setCurrentTime(progress.positionSec);
    }

    lastSavedRef.current = 0;
  }, [activeEpisode]);

  /* ================= AUTOSAVE ================= */

  const handleTimeUpdate = async () => {
    if (!audioRef.current || !activeEpisode) return;

    const current = Math.floor(audioRef.current.currentTime);
    setCurrentTime(current);
    setDuration(audioRef.current.duration || 0);

    if (current - lastSavedRef.current < 10) return;

    lastSavedRef.current = current;

    await fetch(`/api/episodes/${activeEpisode.id}/progress`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        positionSec: current,
        completed: false,
      }),
    });

    setProgressMap((prev) => ({
      ...prev,
      [activeEpisode.id]: {
        episodeId: activeEpisode.id,
        positionSec: current,
        completed: false,
      },
    }));
  };

  const handlePause = async () => {
    if (!audioRef.current || !activeEpisode) return;

    setIsPlaying(false);

    const current = audioRef.current.currentTime;

    await fetch(`/api/episodes/${activeEpisode.id}/progress`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        positionSec: current,
        completed: false,
      }),
    });
  };

  const handleEnded = async () => {
    if (!audioRef.current || !activeEpisode) return;

    const duration = audioRef.current.duration;

    await fetch(`/api/episodes/${activeEpisode.id}/progress`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        positionSec: duration,
        completed: true,
      }),
    });

    setProgressMap((prev) => ({
      ...prev,
      [activeEpisode.id]: {
        episodeId: activeEpisode.id,
        positionSec: duration,
        completed: true,
      },
    }));

    setIsPlaying(false);
    setShowNextButton(true);
  };

  const playNextEpisode = () => {
    if (!activeEpisode) return;
    const index = episodes.findIndex(e => e.id === activeEpisode.id);
    const next = episodes[index + 1];
    if (next) {
      setActiveEpisode(next);
      setShowNextButton(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Učitavanje...</div>;

  if (forbidden) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-semibold mb-3">Potrebna je pretplata</h2>
        <button
          onClick={() => router.push("/app/subscription")}
          className="rounded-xl bg-stone-800 text-white px-6 py-3"
        >
          Pretplati se
        </button>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#f8f4ed] to-[#efe8dd] p-10 pb-40">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-stone-800">Epizode</h1>

        {episodes.map((ep) => {
          const progress = progressMap[ep.id];
          const percent = progress
            ? Math.min(
                100,
                Math.round(
                  (progress.positionSec / ep.durationSec) * 100
                )
              )
            : 0;

          return (
            <div
              key={ep.id}
              className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-lg p-6 flex gap-6 items-center"
            >
              {ep.imageUrlEp && (
                <img
                  src={ep.imageUrlEp}
                  className="w-28 h-20 rounded-xl object-cover"
                />
              )}

              <div className="flex-1">
                <div className="font-semibold text-lg text-stone-800">
                  {ep.title}
                </div>

                {progress?.completed && (
                  <span className="text-xs px-3 py-1 bg-emerald-500 text-white rounded-full">
                    Završeno
                  </span>
                )}

                <div className="text-sm text-stone-500 mt-2">
                  {percent}% preslušano
                </div>

                <div className="w-full h-2 bg-stone-200 rounded-full mt-2">
                  <div
                    className="h-2 bg-stone-700 rounded-full transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveEpisode(ep);
                  setShowNextButton(false);
                }}
                className="rounded-full bg-stone-800 text-white px-6 py-3 hover:bg-black transition"
              >
                ▶ Slušaj
              </button>
            </div>
          );
        })}
      </div>

 {activeEpisode && (
  <div className="fixed bottom-0 left-0 right-0 bg-white/95 border-t shadow-2xl p-6">
    <div className="max-w-5xl mx-auto relative flex items-start gap-6">

      {/* ❌ X dugme */}
      <button
        onClick={() => {
          if (audioRef.current) audioRef.current.pause();
          setActiveEpisode(null);
          setShowNextButton(false);
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        className="absolute right-0 top-0 text-stone-600 hover:text-black text-xl transition"
      >
        ✕
      </button>

      {/* 🎧 SLIKA EPIZODE */}
      {activeEpisode.imageUrlEp && (
        <img
          src={activeEpisode.imageUrlEp}
          className="w-20 h-20 rounded-xl object-cover shadow"
        />
      )}

      {/* DESNI DEO */}
      <div className="flex-1 space-y-3 pr-6">
        <div className="font-semibold text-stone-800">
          {activeEpisode.title}
        </div>

        <audio
          ref={audioRef}
          autoPlay
          onPlay={() => setIsPlaying(true)}
          onPause={handlePause}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          src={`/api/episodes/${activeEpisode.id}/play`}
        />

        <div className="flex items-center gap-4">

          <button
            onClick={() => {
              if (!audioRef.current) return;
              audioRef.current.currentTime -= 15;
            }}
            className="px-4 py-2 bg-stone-200 rounded-full hover:bg-stone-300 transition"
          >
            ⏪ 15s
          </button>

          <button
            onClick={() => {
              if (!audioRef.current) return;
              audioRef.current.paused
                ? audioRef.current.play()
                : audioRef.current.pause();
            }}
            className="px-6 py-3 bg-stone-800 text-white rounded-full hover:bg-black transition"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>

          <button
            onClick={() => {
              if (!audioRef.current) return;
              audioRef.current.currentTime += 15;
            }}
            className="px-4 py-2 bg-stone-200 rounded-full hover:bg-stone-300 transition"
          >
            15s ⏩
          </button>

          <div className="text-sm text-stone-600 ml-4">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => {
            if (!audioRef.current) return;
            const newTime = Number(e.target.value);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }}
          className="w-full accent-stone-800"
        />

        {showNextButton && (
          <div className="flex justify-end">
            <button
              onClick={playNextEpisode}
              className="px-6 py-2 rounded-full bg-stone-800 text-white"
            >
              ▶ Sledeća epizoda
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}
    </section>
  );
}