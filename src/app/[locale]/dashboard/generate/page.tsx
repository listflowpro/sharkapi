"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useDashboardUser } from "@/components/dashboard/DashboardUserProvider";
import { cn } from "@/lib/utils";

type Variant = "1k" | "2k";
type JobPhase = "idle" | "uploading" | "submitting" | "queued" | "processing" | "completed" | "failed";

const COST: Record<Variant, number> = { "1k": 0.03, "2k": 0.05 };
const POLL_INTERVAL_MS = 2500;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_MIME = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ESTIMATED_SECONDS = 120; // ~2 min expected generation time

interface JobOutput {
  file_url: string | null;
  text_content: string | null;
  output_type: string;
}

interface LibraryItem {
  job_id: string;
  prompt: string;
  variant: string;
  price_usd: number;
  created_at: string;
  image_url: string;
}

const PHASE_LABEL: Record<JobPhase, string> = {
  idle:        "",
  uploading:   "Uploading reference image...",
  submitting:  "Submitting job...",
  queued:      "Job queued — waiting for worker...",
  processing:  "Generating your image...",
  completed:   "",
  failed:      "",
};

export default function GeneratePage() {
  const user = useDashboardUser();

  const [prompt, setPrompt]           = useState("");
  const [variant, setVariant]         = useState<Variant>("1k");
  const [imgFile, setImgFile]         = useState<File | null>(null);
  const [imgPreview, setImgPreview]   = useState<string | null>(null);
  const [dragging, setDragging]       = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [error, setError]             = useState("");

  const [phase, setPhase]       = useState<JobPhase>("idle");
  const [jobId, setJobId]       = useState<string | null>(null);
  const [output, setOutput]     = useState<JobOutput | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  // Library
  const [library, setLibrary]         = useState<LibraryItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [lightbox, setLightbox]       = useState<LibraryItem | null>(null);

  const [elapsed, setElapsed] = useState(0); // seconds since job queued

  const fileRef    = useRef<HTMLInputElement>(null);
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef<number>(0);

  const balance   = user?.walletBalance ?? 0;
  const canSubmit = balance >= COST[variant];

  const fetchLibrary = useCallback(async () => {
    try {
      const res = await fetch("/api/playground/library");
      if (!res.ok) return;
      const data = await res.json();
      setLibrary(data.items ?? []);
    } catch { /* ignore */ } finally {
      setLibraryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    startedRef.current = Date.now();
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/playground/jobs/${id}`);
      const data = await res.json();
      if (!res.ok) {
        stopPolling();
        setPhase("failed");
        setJobError(data.error ?? "Failed to fetch job status.");
        return;
      }
      if (data.status === "queued") {
        setPhase("queued");
      } else if (data.status === "processing") {
        setPhase("processing");
      } else if (data.status === "completed") {
        stopPolling();
        stopTimer();
        setOutput(data.output);
        setPhase("completed");
        fetchLibrary();
      } else if (data.status === "failed" || data.status === "cancelled") {
        stopPolling();
        stopTimer();
        setPhase("failed");
        setJobError(data.error ?? "Job failed.");
      }
    } catch {
      // network hiccup — keep polling
    }
  }, [stopPolling, fetchLibrary]);

  useEffect(() => {
    return () => { stopPolling(); stopTimer(); };
  }, [stopPolling, stopTimer]);

  const handleFile = (file: File) => {
    if (!ACCEPTED_MIME.includes(file.type.toLowerCase())) {
      setUploadError("Unsupported file type. Use JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File exceeds 10 MB limit.");
      return;
    }
    setUploadError("");
    setImgFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImgPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImgFile(null);
    setImgPreview(null);
    setUploadError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onGenerate = async () => {
    if (!prompt.trim()) { setError("Prompt is required."); return; }
    if (!canSubmit)     { setError("Insufficient wallet balance."); return; }
    setError("");
    setJobId(null);
    setOutput(null);
    setJobError(null);

    let imageUrl: string | undefined;
    if (imgFile) {
      setPhase("uploading");
      try {
        const form = new FormData();
        form.append("file", imgFile);
        const uploadRes = await fetch("/api/playground/upload", {
          method: "POST",
          body: form,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setPhase("failed");
          setJobError(uploadData.error ?? "Image upload failed.");
          return;
        }
        imageUrl = uploadData.url as string;
      } catch {
        setPhase("failed");
        setJobError("Image upload failed. Please try again.");
        return;
      }
    }

    setPhase("submitting");
    try {
      const body: Record<string, unknown> = { prompt: prompt.trim(), variant };
      if (imageUrl) body.image_url = imageUrl;

      const res = await fetch("/api/playground/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setPhase("failed");
        setJobError(data.error ?? "Failed to create job.");
        return;
      }
      const id: string = data.job_id;
      setJobId(id);
      setPhase("queued");
      startTimer();
      pollRef.current = setInterval(() => pollStatus(id), POLL_INTERVAL_MS);
    } catch {
      setPhase("failed");
      setJobError("Network error. Please try again.");
    }
  };

  const onReset = () => {
    stopPolling();
    stopTimer();
    setElapsed(0);
    setPhase("idle");
    setPrompt("");
    clearImage();
    setError("");
    setJobId(null);
    setOutput(null);
    setJobError(null);
  };

  const isActive = phase !== "idle" && phase !== "completed" && phase !== "failed";

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Playground</h1>
          <p className="text-sm text-gray-700 mt-0.5">Generate AI images interactively.</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-aqua-400/10 border border-aqua-400/25 shrink-0">
          <span className="text-sm font-bold text-aqua-400">${balance.toFixed(2)}</span>
          <span className="text-sm text-white/60 ml-1.5">balance</span>
        </div>
      </div>

      {/* Loading — progress bar */}
      {isActive && (() => {
        // Progress: linear up to 92%, slows to a crawl after that so it never hits 100%
        const raw = Math.min(elapsed / ESTIMATED_SECONDS, 1);
        const pct = raw < 0.85 ? raw : 0.85 + (raw - 0.85) * 0.15;
        const displayPct = Math.round(pct * 100);
        const remaining = Math.max(0, ESTIMATED_SECONDS - elapsed);
        const isGenerating = phase === "queued" || phase === "processing";
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        const remainingStr = mins > 0
          ? `~${mins}m ${secs}s remaining`
          : `~${secs}s remaining`;

        return (
          <div className="rounded-2xl border border-electric-400/20 bg-ocean-800 p-8 space-y-6">
            {/* Spinner + label */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="w-12 h-12 rounded-full border-2 border-electric-400/20 border-t-electric-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-electric-400/15 animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">{PHASE_LABEL[phase]}</p>
                {jobId && <p className="text-xs font-mono text-white/30 mt-0.5">{jobId.slice(0, 16)}…</p>}
              </div>
            </div>

            {/* Progress bar — only shown once job is actually queued/processing */}
            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/40">Generating your image</span>
                  <span className="text-electric-400 font-mono font-bold">{displayPct}%</span>
                </div>

                {/* Track */}
                <div className="relative h-2 rounded-full bg-ocean-900/80 overflow-hidden">
                  {/* Animated shimmer */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-linear"
                    style={{
                      width: `${displayPct}%`,
                      background: "linear-gradient(90deg, #0080b0, #00AEEF, #40cfff)",
                    }}
                  />
                  {/* Moving glow dot */}
                  <div
                    className="absolute top-0 h-full w-8 transition-all duration-1000 ease-linear"
                    style={{
                      left: `calc(${displayPct}% - 16px)`,
                      background: "linear-gradient(90deg, transparent, rgba(0,174,239,0.6), transparent)",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-white/30">
                  <span>{elapsed}s elapsed</span>
                  <span>{elapsed < ESTIMATED_SECONDS ? remainingStr : "almost done…"}</span>
                </div>
              </div>
            )}

            {/* Info pill */}
            {isGenerating && (
              <p className="text-center text-xs text-white/25">
                AI image generation takes 30 – 120 seconds. Please keep this tab open.
              </p>
            )}
          </div>
        );
      })()}

      {/* Completed */}
      {phase === "completed" && output && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 overflow-hidden">
            {(output.file_url || output.text_content) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={output.file_url ?? output.text_content!} alt="Generated" className="w-full" />
            )}
            <div className="p-5 space-y-3">
              <h2 className="text-sm font-bold text-white">Result</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Job ID", val: (jobId?.slice(0, 8) ?? "") + "...", cls: "text-white/60 font-mono text-xs" },
                  { label: "Mode",   val: variant.toUpperCase(),               cls: "text-white font-bold font-mono" },
                  { label: "Cost",   val: `$${COST[variant].toFixed(2)}`,      cls: "text-aqua-400 font-bold" },
                ].map(({ label, val, cls }) => (
                  <div key={label} className="rounded-xl bg-ocean-700 border border-ocean-600/50 p-3">
                    <p className="text-xs text-white/50 mb-1">{label}</p>
                    <p className={cn("text-sm truncate", cls)}>{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button onClick={onReset} className="w-full py-3 rounded-xl border border-ocean-600/60 text-sm font-medium text-white/70 hover:text-white hover:bg-ocean-800/40 transition-colors">
            Generate another
          </button>
        </div>
      )}

      {/* Failed */}
      {phase === "failed" && (
        <div className="rounded-2xl border border-coral-400/30 bg-coral-400/5 p-6 space-y-3">
          <p className="text-sm font-semibold text-coral-400">Job failed</p>
          <p className="text-sm text-white/60">{jobError}</p>
          <button onClick={onReset} className="text-sm text-white/50 hover:text-white transition-colors">Try again</button>
        </div>
      )}

      {/* Form */}
      {phase === "idle" && (
        <div className="rounded-2xl border border-ocean-600/60 bg-ocean-800 p-6 space-y-5">

          {/* 1. Image upload */}
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-widest mb-2">
              Reference Image <span className="text-white/30 font-normal normal-case tracking-normal">(optional)</span>
            </p>
            {imgPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-ocean-600/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgPreview} alt="Reference" className="w-full max-h-48 object-cover" />
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-ocean-800/90 text-xs text-white/50 border border-ocean-600/60 max-w-[140px] truncate">
                    {imgFile?.name}
                  </span>
                  <button onClick={clearImage} className="px-2.5 py-1 rounded-lg bg-ocean-800/90 text-sm text-white border border-ocean-600/60 hover:bg-ocean-700 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all",
                  dragging ? "border-electric-400 bg-electric-400/5" : "border-ocean-600/60 hover:border-ocean-400/60 hover:bg-ocean-700/30"
                )}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7 mx-auto mb-1.5 text-white/40">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M3.75 4.5h.007v.008H3.75V4.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 4.5h.007v.008H12V4.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-sm text-white/60">Drop image here or click to upload</p>
                <p className="text-xs text-white/30 mt-0.5">JPEG, PNG, WebP — max 10 MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {uploadError && <p className="text-xs text-coral-400 mt-1.5">{uploadError}</p>}
          </div>

          {/* 2. Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-white uppercase tracking-widest">Prompt</label>
              <span className="text-xs text-white/30">{prompt.length}/2000</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => { setPrompt(e.target.value.slice(0, 2000)); setError(""); }}
              placeholder="Describe the image you want to generate..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-ocean-900/60 border border-ocean-600/60 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-electric-400/40 resize-none"
            />
            {error && <p className="text-sm text-coral-400 mt-1.5">{error}</p>}
          </div>

          {/* 3. Variant */}
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-widest mb-2">Resolution</p>
            <div className="grid grid-cols-2 gap-3">
              {(["1k", "2k"] as const).map((v) => {
                const isComingSoon = v === "2k";
                return (
                  <button key={v} onClick={() => !isComingSoon && setVariant(v)}
                    disabled={isComingSoon}
                    className={cn(
                      "relative p-4 rounded-xl border-2 text-left transition-all",
                      isComingSoon
                        ? "border-ocean-600/30 bg-ocean-900/20 cursor-not-allowed opacity-50"
                        : variant === v ? "border-electric-400 bg-electric-400/10" : "border-ocean-600/60 bg-ocean-900/40 hover:border-ocean-400/60"
                    )}
                  >
                    {!isComingSoon && variant === v && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-electric-400" />}
                    {isComingSoon && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-ocean-600/60 text-white/40 border border-ocean-500/30">
                        Soon
                      </span>
                    )}
                    <p className={cn("text-xl font-black", !isComingSoon && variant === v ? "text-electric-400" : "text-white/50")}>{v.toUpperCase()}</p>
                    <p className="text-xs text-white/30 mt-0.5">{v === "1k" ? "1024 x 1024" : "2048 x 2048"}</p>
                    <p className={cn("text-sm font-bold mt-1.5", !isComingSoon && variant === v ? "text-electric-400" : "text-white/30")}>${COST[v].toFixed(2)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Generate */}
          <button
            onClick={onGenerate}
            disabled={!canSubmit}
            className={cn(
              "w-full py-3.5 rounded-xl text-sm font-bold transition-all",
              canSubmit ? "bg-electric-400 text-ocean-900 hover:bg-electric-300 cursor-pointer" : "bg-ocean-900 text-white/30 cursor-not-allowed"
            )}
          >
            {canSubmit
              ? imgFile
                ? `Upload & Generate — $${COST[variant].toFixed(2)}`
                : `Generate — $${COST[variant].toFixed(2)}`
              : "Insufficient balance"}
          </button>
        </div>
      )}

      {/* ── Library ─────────────────────────────────────────────── */}
      {(libraryLoading || library.length > 0) && (
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">My Library</h2>
            <span className="text-xs text-white/30">{library.length} images</span>
          </div>

          {libraryLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-ocean-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {library.map((item) => (
                <button
                  key={item.job_id}
                  onClick={() => setLightbox(item)}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-ocean-600/40 hover:border-electric-400/40 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-ocean-900/0 group-hover:bg-ocean-900/60 transition-all duration-200 flex flex-col justify-end p-2.5 opacity-0 group-hover:opacity-100">
                    <p className="text-xs text-white line-clamp-2 leading-snug">{item.prompt}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-white/50 font-mono">{item.variant.toUpperCase()}</span>
                      <span className="text-xs text-aqua-400 font-bold">${item.price_usd.toFixed(2)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-900/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden border border-ocean-600/60 bg-ocean-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-ocean-900/80 text-white/60 hover:text-white hover:bg-ocean-700 transition-colors text-lg leading-none"
            >
              ×
            </button>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightbox.image_url} alt={lightbox.prompt} className="w-full" />

            {/* Meta */}
            <div className="p-5 space-y-3">
              <p className="text-sm text-white/80 leading-relaxed">{lightbox.prompt}</p>
              <div className="flex items-center gap-3 text-xs text-white/40">
                <span className="font-mono font-bold text-white/60">{lightbox.variant.toUpperCase()}</span>
                <span>·</span>
                <span className="text-aqua-400 font-bold">${lightbox.price_usd.toFixed(2)}</span>
                <span>·</span>
                <span>{new Date(lightbox.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setPrompt(lightbox.prompt);
                    setVariant(lightbox.variant as Variant);
                    setLightbox(null);
                    onReset();
                    setPrompt(lightbox.prompt);
                    setVariant(lightbox.variant as Variant);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-electric-400 text-ocean-900 text-sm font-bold hover:bg-electric-300 transition-colors"
                >
                  Use this prompt
                </button>
                <a
                  href={lightbox.image_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl border border-ocean-600/60 text-sm font-medium text-white/60 hover:text-white hover:bg-ocean-700 transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
