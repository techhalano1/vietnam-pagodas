"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cueIndexAt, formatTime, type AudioCue } from "@/lib/scripture-audio";

const SPEEDS = [0.75, 1, 1.25, 1.5];
const REPEATS = [1, 3, 7, 21, 108];
const ACTIVE_CLASSES = ["ring-2", "ring-amber-400", "border-amber-400", "dark:ring-amber-500"];

export interface AudioLabels {
  listen: string;
  play: string;
  pause: string;
  speed: string;
  repeat: string;
  repeatOnce: string;
  repeatUnit: string;
  round: string;
  seek: string;
  voiceNote: string;
  download: string;
}

interface Props {
  src: string;
  title: string;
  durationSec: number;
  cues: AudioCue[];
  labels: AudioLabels;
}

/**
 * Audio player for a scripture page. Verses are server-rendered as <li id={cue.id}>;
 * this component highlights the verse being spoken and lets a click on a verse seek to it.
 */
export default function ScriptureAudioPlayer({ src, title, durationSec, cues, labels }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(durationSec);
  const [speed, setSpeed] = useState(1);
  const [repeat, setRepeat] = useState(1);
  const [round, setRound] = useState(1);
  const [error, setError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const activeIdx = playing || time > 0 ? cueIndexAt(cues, time) : -1;
  const startedRef = useRef(false);

  // Highlight + follow the spoken verse.
  useEffect(() => {
    if (activeIdx < 0) return;
    const el = document.getElementById(cues[activeIdx].id);
    if (!el) return;
    el.classList.add(...ACTIVE_CLASSES);
    if (playing) {
      const r = el.getBoundingClientRect();
      const out = r.top < 80 || r.bottom > window.innerHeight - 140;
      if (out) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    return () => el.classList.remove(...ACTIVE_CLASSES);
  }, [activeIdx, cues, playing]);

  // Click a verse → seek to it (only once playback has been started).
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!startedRef.current) return;
      const target = e.target as HTMLElement | null;
      if (!target || target.closest("a,button")) return;
      const li = target.closest("li[data-cue-start]") as HTMLElement | null;
      if (!li) return;
      const start = Number(li.dataset.cueStart);
      const a = audioRef.current;
      if (!a || Number.isNaN(start)) return;
      a.currentTime = start;
      if (a.paused) a.play().catch(() => setError(true));
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (a) a.playbackRate = speed;
  }, [speed]);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      startedRef.current = true;
      a.play().catch(() => setError(true));
    } else {
      a.pause();
    }
  }, []);

  const onEnded = () => {
    const a = audioRef.current;
    if (!a) return;
    if (round < repeat) {
      setRound(round + 1);
      a.currentTime = 0;
      a.play().catch(() => setError(true));
    } else {
      setRound(1);
      setPlaying(false);
    }
  };

  const seek = (sec: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Math.max(0, Math.min(sec, duration));
    setTime(a.currentTime);
  };

  const repeatLabel = (n: number) =>
    n === 1 ? labels.repeatOnce : labels.repeatUnit === "×" ? `${n}×` : `${n} ${labels.repeatUnit}`;
  const pct = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  return (
    <div className="sticky bottom-3 z-30 mt-6">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration);
        }}
        onEnded={onEnded}
        onError={() => setError(true)}
      />
      <div className="rounded-2xl border border-amber-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-amber-900/60 dark:bg-stone-900/95">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? labels.pause : labels.play}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow transition hover:brightness-110"
          >
            {playing ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="truncate font-medium text-stone-800 dark:text-stone-100">
                {activeIdx >= 0 ? `${title} · ${activeIdx + 1}/${cues.length}` : title}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatTime(time)} / {formatTime(duration)}
                {repeat > 1 ? ` · ${labels.round} ${round}/${repeat}` : ""}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(1, duration)}
              step={0.1}
              value={Math.min(time, duration)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label={labels.seek}
              className="mt-1 w-full cursor-pointer accent-amber-600"
            />
            <span className="sr-only">{Math.round(pct)}%</span>
          </div>
          <button
            type="button"
            onClick={() => setShowOptions((v) => !v)}
            aria-expanded={showOptions}
            aria-label={`${labels.speed} / ${labels.repeat}`}
            className="shrink-0 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-600 hover:border-amber-300 dark:border-stone-700 dark:text-stone-300"
          >
            {speed}× · {repeatLabel(repeat)}
          </button>
        </div>

        {showOptions && (
          <div className="mt-3 grid gap-3 border-t border-stone-100 pt-3 text-xs dark:border-stone-800 sm:grid-cols-2">
            <div>
              <div className="mb-1 font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">{labels.speed}</div>
              <div className="flex flex-wrap gap-1.5">
                {SPEEDS.map((s) => (
                  <Chip key={s} active={s === speed} onClick={() => setSpeed(s)}>
                    {s}×
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">{labels.repeat}</div>
              <div className="flex flex-wrap gap-1.5">
                {REPEATS.map((n) => (
                  <Chip
                    key={n}
                    active={n === repeat}
                    onClick={() => {
                      setRepeat(n);
                      setRound(1);
                    }}
                  >
                    {repeatLabel(n)}
                  </Chip>
                ))}
              </div>
            </div>
            <p className="text-stone-500 dark:text-stone-400 sm:col-span-2">
              {labels.voiceNote}{" "}
              <a href={src} download className="text-amber-700 hover:underline dark:text-amber-400">
                {labels.download}
              </a>
            </p>
          </div>
        )}
        {error && (
          <p className="mt-2 text-xs text-red-700 dark:text-red-400">
            Không tải được âm thanh / Could not load audio.
          </p>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-2.5 py-1 font-medium transition ${
        active
          ? "bg-amber-600 text-white"
          : "bg-stone-100 text-stone-700 hover:bg-amber-100 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
      }`}
    >
      {children}
    </button>
  );
}
