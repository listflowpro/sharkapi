import { createServiceClient } from "@/lib/supabase/service";

export async function ShowcaseGallery() {
  const service = createServiceClient();
  const { data: images } = await service
    .from("showcase_images")
    .select("id, url, alt")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!images || images.length === 0) return null;

  // Duplicate for seamless infinite loop
  const strip = [...images, ...images];

  return (
    <section className="bg-ocean-950 py-10 overflow-hidden relative">
      {/* Left fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #02080f, transparent)" }}
      />
      {/* Right fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #02080f, transparent)" }}
      />

      <div
        className="flex gap-4"
        style={{
          width: "max-content",
          animation: `showcase-scroll ${images.length * 4}s linear infinite`,
          willChange: "transform",
        }}
      >
        {strip.map((img, i) => (
          <div
            key={`${img.id}-${i}`}
            className="shrink-0 rounded-xl overflow-hidden border border-ocean-700/30"
            style={{ width: 220, height: 220 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.alt ?? "AI generated image"}
              width={220}
              height={220}
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes showcase-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
