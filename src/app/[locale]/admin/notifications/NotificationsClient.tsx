"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TelegramConfig {
  id: string;
  name: string;
  chat_id: string;
  is_active: boolean;
  created_at: string;
}

export function NotificationsClient({ initialConfigs }: { initialConfigs: TelegramConfig[] }) {
  const [configs, setConfigs]         = useState<TelegramConfig[]>(initialConfigs);
  const [linking, setLinking]         = useState(false);
  const [pendingToken, setPendingToken] = useState<string | null>(null);
  const [testing, setTesting]         = useState(false);
  const [webhookOk, setWebhookOk]     = useState<boolean | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);
  const pollRef                       = useRef<ReturnType<typeof setInterval> | null>(null);

  function flash(msg: string, type: "ok" | "err") {
    if (type === "ok") { setSuccess(msg); setError(null); }
    else               { setError(msg);   setSuccess(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 5000);
  }

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setPendingToken(null);
    setLinking(false);
  }, []);

  // Poll until token is consumed (Telegram connected)
  const startPolling = useCallback((token: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      const res  = await fetch(`/api/admin/telegram/link?token=${token}`);
      const json = await res.json();

      if (json.status === "connected") {
        stopPolling();
        // Refresh configs list
        const r2   = await fetch("/api/admin/telegram");
        const data = await r2.json();
        setConfigs(data.configs ?? []);
        flash("Telegram başarıyla bağlandı! 🎉", "ok");
      }

      // Timeout after 3 minutes
      if (attempts > 90) {
        stopPolling();
        flash("Süre doldu. Tekrar deneyin.", "err");
      }
    }, 2000);
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  async function handleConnect() {
    setLinking(true);
    const res  = await fetch("/api/admin/telegram/link", { method: "POST" });
    const json = await res.json();
    if (!res.ok) { setLinking(false); flash(json.error ?? "Hata oluştu.", "err"); return; }

    setPendingToken(json.token);
    window.open(json.url, "_blank");
    startPolling(json.token);
  }

  async function handleToggle(id: string, current: boolean) {
    const res = await fetch(`/api/admin/telegram/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !current }),
    });
    if (!res.ok) { flash("Güncelleme başarısız.", "err"); return; }
    setConfigs((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !current } : c));
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu Telegram bağlantısını silmek istiyor musunuz?")) return;
    const res = await fetch(`/api/admin/telegram/${id}`, { method: "DELETE" });
    if (!res.ok) { flash("Silme başarısız.", "err"); return; }
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    flash("Silindi.", "ok");
  }

  async function handleTest() {
    setTesting(true);
    const res = await fetch("/api/admin/telegram/test", { method: "POST" });
    setTesting(false);
    if (res.ok) flash("Test mesajı gönderildi! Telegramı kontrol edin.", "ok");
    else        flash("Gönderim başarısız. Chat ID'leri kontrol edin.", "err");
  }

  async function handleSetupWebhook() {
    const res  = await fetch("/api/admin/telegram/setup", { method: "POST" });
    const data = await res.json();
    if (data.ok) { setWebhookOk(true); flash("Webhook kaydedildi ✅", "ok"); }
    else         { flash(`Webhook hatası: ${data.description ?? "bilinmiyor"}`, "err"); }
  }

  const active = configs.filter((c) => c.is_active).length;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Telegram Bildirimleri</h1>
        <p className="text-sm text-white/50">
          {configs.length} bağlantı — {active} aktif
        </p>
      </div>

      {/* Flash */}
      {success && (
        <div className="px-4 py-3 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 text-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Connect button */}
      <div className="rounded-xl border border-ocean-600/30 bg-ocean-900/40 p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white mb-1">Telegram Bağla</h2>
          <p className="text-xs text-white/40">
            Butona bas → Telegram açılır → Start'a bas → otomatik bağlanır.
          </p>
        </div>

        {!pendingToken ? (
          <button
            onClick={handleConnect}
            disabled={linking}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1a8bc4] text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.46 14.453l-2.95-.924c-.642-.204-.654-.642.136-.953l11.57-4.461c.537-.194 1.006.131.346.133z"/>
            </svg>
            Telegram&apos;ı Bağla
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean-700/50 border border-ocean-600/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm text-white/70">Telegram bekleniyor…</span>
            </div>
            <button
              onClick={stopPolling}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              İptal
            </button>
          </div>
        )}

        {/* Test + actions row */}
        {configs.length > 0 && (
          <div className="flex gap-3 pt-1 border-t border-ocean-700/40">
            <button
              onClick={handleTest}
              disabled={testing || active === 0}
              className="px-4 py-2 rounded-lg bg-ocean-700/60 border border-ocean-600/40 text-white/70 text-sm font-medium hover:text-white hover:bg-ocean-600/60 disabled:opacity-40 transition-colors"
            >
              {testing ? "Gönderiliyor…" : "Test Mesajı Gönder"}
            </button>
          </div>
        )}
      </div>

      {/* Config list */}
      {configs.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-8">Henüz bağlı Telegram yok.</p>
      ) : (
        <div className="space-y-2">
          {configs.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-ocean-600/25 bg-ocean-900/30"
            >
              <div className="w-8 h-8 rounded-full bg-[#229ED9]/20 border border-[#229ED9]/30 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.46 14.453l-2.95-.924c-.642-.204-.654-.642.136-.953l11.57-4.461c.537-.194 1.006.131.346.133z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{c.name}</p>
                <p className="text-xs text-white/35 font-mono">chat_id: {c.chat_id}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                c.is_active
                  ? "bg-green-500/15 text-green-400 border-green-500/30"
                  : "bg-white/5 text-white/30 border-white/10"
              }`}>
                {c.is_active ? "Aktif" : "Pasif"}
              </span>
              <button
                onClick={() => handleToggle(c.id, c.is_active)}
                className="text-xs px-2 py-1 rounded bg-ocean-700/50 text-white/60 hover:text-white border border-ocean-600/30 hover:bg-ocean-600/50 transition-colors"
              >
                {c.is_active ? "Durdur" : "Aç"}
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Notification events */}
      <div className="rounded-xl border border-ocean-600/20 bg-ocean-900/20 p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Gönderilen Bildirimler</h2>
        <ul className="space-y-2 text-sm text-white/50">
          {[
            { icon: "🆕", label: "Yeni kullanıcı kaydı" },
            { icon: "💳", label: "Cüzdan doldurma" },
            { icon: "⚠️", label: "Düşük bakiye (son job sonrası < $0.10)" },
            { icon: "❌", label: "Job başarısız" },
            { icon: "📊", label: "Her akşam 22:00 — günlük özet" },
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span>{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Webhook setup — advanced */}
      <details className="rounded-xl border border-ocean-700/20 bg-ocean-900/10">
        <summary className="px-4 py-3 text-xs text-white/30 cursor-pointer hover:text-white/50 transition-colors">
          ⚙️ Gelişmiş — Webhook Kurulumu
        </summary>
        <div className="px-4 pb-4 space-y-3">
          <p className="text-xs text-white/40">
            İlk kurulumda veya URL değiştiğinde Telegram&apos;a webhook adresimizi bildirmek için bir kez tıklayın.
          </p>
          <button
            onClick={handleSetupWebhook}
            className="px-4 py-2 rounded-lg bg-ocean-700/60 border border-ocean-600/40 text-white/70 text-xs hover:text-white hover:bg-ocean-600/60 transition-colors"
          >
            {webhookOk ? "✅ Webhook Kayıtlı" : "Webhook'u Kaydet"}
          </button>
        </div>
      </details>
    </div>
  );
}
