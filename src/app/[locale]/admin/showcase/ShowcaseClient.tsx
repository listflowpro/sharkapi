"use client";

import { useState } from "react";

interface ShowcaseImage {
  id: string;
  url: string;
  alt: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export function ShowcaseClient({ initialImages }: { initialImages: ShowcaseImage[] }) {
  const [images, setImages] = useState<ShowcaseImage[]>(initialImages);
  const [url, setUrl]       = useState("");
  const [alt, setAlt]       = useState("");
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError]   = useState<string | null>(null);

  function flash(msg: string, type: "ok" | "err") {
    if (type === "ok") { setSuccess(msg); setError(null); }
    else               { setError(msg);   setSuccess(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 4000);
  }

  async function handleAdd() {
    if (!url.trim()) return;
    setAdding(true);
    const res  = await fetch("/api/admin/showcase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), alt: alt.trim() || null }),
    });
    const json = await res.json();
    setAdding(false);
    if (!res.ok) { flash(json.error ?? "Hata oluştu.", "err"); return; }
    setImages((prev) => [...prev, json.image]);
    setUrl(""); setAlt("");
    flash("Görsel eklendi.", "ok");
  }

  async function handleToggle(id: string, current: boolean) {
    const res = await fetch(`/api/admin/showcase/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    if (!res.ok) { flash("Güncelleme başarısız.", "err"); return; }
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, is_active: !current } : img));
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu görseli silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/admin/showcase/${id}`, { method: "DELETE" });
    if (!res.ok) { flash("Silme başarısız.", "err"); return; }
    setImages((prev) => prev.filter((img) => img.id !== id));
    flash("Silindi.", "ok");
  }

  const active = images.filter((i) => i.is_active).length;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Showcase Galerisi</h1>
        <p className="text-sm text-white/50">{images.length} görsel — {active} aktif</p>
      </div>

      {success && (
        <div className="px-4 py-3 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-sm">{success}</div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">{error}</div>
      )}

      {/* Add form */}
      <div className="rounded-xl border border-ocean-600/30 bg-ocean-900/40 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">Görsel Ekle</h2>
        <p className="text-xs text-white/40">
          Supabase generated-images bucket'ındaki veya herhangi bir public URL girin.
        </p>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://... (görsel URL)"
          className="w-full px-3 py-2 rounded-lg bg-ocean-800/60 border border-ocean-600/40 text-sm text-white placeholder-white/30 focus:outline-none focus:border-electric-400/60"
        />
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Alt metin (opsiyonel)"
          className="w-full px-3 py-2 rounded-lg bg-ocean-800/60 border border-ocean-600/40 text-sm text-white placeholder-white/30 focus:outline-none focus:border-electric-400/60"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !url.trim()}
          className="px-4 py-2 rounded-lg bg-electric-400 text-ocean-900 text-sm font-semibold disabled:opacity-40 hover:bg-electric-300 transition-colors"
        >
          {adding ? "Ekleniyor…" : "Ekle"}
        </button>
      </div>

      {/* Image grid */}
      {images.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-8">Henüz görsel yok.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative rounded-xl overflow-hidden border group ${
                img.is_active ? "border-ocean-600/30" : "border-ocean-700/20 opacity-50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => handleToggle(img.id, img.is_active)}
                  className="text-xs px-3 py-1 rounded-lg bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-colors"
                >
                  {img.is_active ? "Gizle" : "Göster"}
                </button>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                >
                  Sil
                </button>
              </div>
              {!img.is_active && (
                <span className="absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded bg-black/60 text-white/50">Gizli</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
