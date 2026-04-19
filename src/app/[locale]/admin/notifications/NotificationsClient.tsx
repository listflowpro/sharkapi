"use client";

import { useState } from "react";

interface TelegramConfig {
  id: string;
  name: string;
  chat_id: string;
  is_active: boolean;
  created_at: string;
}

export function NotificationsClient({ initialConfigs }: { initialConfigs: TelegramConfig[] }) {
  const [configs, setConfigs]     = useState<TelegramConfig[]>(initialConfigs);
  const [name, setName]           = useState("");
  const [chatId, setChatId]       = useState("");
  const [adding, setAdding]       = useState(false);
  const [testing, setTesting]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);

  function flash(msg: string, type: "ok" | "err") {
    if (type === "ok") { setSuccess(msg); setError(null); }
    else               { setError(msg);   setSuccess(null); }
    setTimeout(() => { setSuccess(null); setError(null); }, 4000);
  }

  async function handleAdd() {
    if (!name.trim() || !chatId.trim()) return;
    setAdding(true);
    const res = await fetch("/api/admin/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), chat_id: chatId.trim() }),
    });
    const json = await res.json();
    setAdding(false);
    if (!res.ok) { flash(json.error ?? "Hata oluştu.", "err"); return; }
    setConfigs((prev) => [json.config, ...prev]);
    setName(""); setChatId("");
    flash("Telegram başarıyla eklendi.", "ok");
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
    if (!confirm("Bu Telegram bağlantısını silmek istediğinize emin misiniz?")) return;
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
    else        flash("Test mesajı gönderilemedi.", "err");
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

      {/* Flash messages */}
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

      {/* Add form */}
      <div className="rounded-xl border border-ocean-600/30 bg-ocean-900/40 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-white">Yeni Telegram Ekle</h2>
        <p className="text-xs text-white/40">
          Botunuza <code className="text-electric-400">/start</code> yazın, ardından{" "}
          <code className="text-electric-400">https://api.telegram.org/bot{"{TOKEN}"}/getUpdates</code>{" "}
          adresinden Chat ID&apos;nizi öğrenin.
        </p>
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="İsim (ör: Ana Kanal)"
            className="flex-1 px-3 py-2 rounded-lg bg-ocean-800/60 border border-ocean-600/40 text-sm text-white placeholder-white/30 focus:outline-none focus:border-electric-400/60"
          />
          <input
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Chat ID (ör: 123456789)"
            className="flex-1 px-3 py-2 rounded-lg bg-ocean-800/60 border border-ocean-600/40 text-sm text-white placeholder-white/30 focus:outline-none focus:border-electric-400/60"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAdd}
            disabled={adding || !name.trim() || !chatId.trim()}
            className="px-4 py-2 rounded-lg bg-electric-400 text-ocean-900 text-sm font-semibold disabled:opacity-40 hover:bg-electric-300 transition-colors"
          >
            {adding ? "Ekleniyor…" : "Ekle"}
          </button>
          {configs.length > 0 && (
            <button
              onClick={handleTest}
              disabled={testing || active === 0}
              className="px-4 py-2 rounded-lg bg-ocean-700/60 border border-ocean-600/40 text-white/70 text-sm font-medium hover:text-white hover:bg-ocean-600/60 disabled:opacity-40 transition-colors"
            >
              {testing ? "Gönderiliyor…" : "Test Gönder"}
            </button>
          )}
        </div>
      </div>

      {/* Config list */}
      {configs.length === 0 ? (
        <p className="text-sm text-white/30 text-center py-8">
          Henüz Telegram bağlantısı yok.
        </p>
      ) : (
        <div className="space-y-2">
          {configs.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border border-ocean-600/25 bg-ocean-900/30"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{c.name}</p>
                <p className="text-xs text-white/40 font-mono">{c.chat_id}</p>
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

      {/* Notification events info */}
      <div className="rounded-xl border border-ocean-600/20 bg-ocean-900/20 p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Gönderilen Bildirimler</h2>
        <ul className="space-y-2 text-sm text-white/50">
          {[
            { icon: "🆕", label: "Yeni kullanıcı kaydı" },
            { icon: "💳", label: "Cüzdan doldurma" },
            { icon: "⚠️", label: "Düşük bakiye uyarısı (son job sonrası < $0.10)" },
            { icon: "❌", label: "Job başarısız olduğunda" },
            { icon: "📊", label: "Her akşam 22:00'de günlük özet (son 24 saat)" },
          ].map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <span>{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
