"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type Lang = "curl" | "js" | "python";
type Step = "request" | "poll" | "result";

const CODE: Record<Lang, Record<Step, string>> = {
  curl: {
    request: `curl -X POST https://api.sharkapi.dev/v1/generate \\
  -H "Authorization: Bearer sk_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "mode": "2k",
    "prompt": "Deep ocean shark, cinematic lighting, 8K"
  }'`,
    poll: `# Returns immediately — poll until status is "complete"
curl https://api.sharkapi.dev/v1/jobs/job_8f2a9d3c \\
  -H "Authorization: Bearer sk_live_••••••••"`,
    result: `{
  "job_id":    "job_8f2a9d3c",
  "status":    "complete",
  "image_url": "https://cdn.sharkapi.dev/out/job_8f2a9d3c.jpg",
  "mode":      "2k",
  "cost":      "$0.02",
  "created_at":"2024-01-15T10:23:44Z"
}`,
  },

  js: {
    request: `const response = await fetch(
  "https://api.sharkapi.dev/v1/generate",
  {
    method: "POST",
    headers: {
      "Authorization": "Bearer sk_live_••••••••",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mode: "2k",
      prompt: "Deep ocean shark, cinematic lighting, 8K",
    }),
  }
);
const { job_id } = await response.json();`,
    poll: `// Poll every 2 seconds until complete
async function waitForJob(jobId) {
  while (true) {
    const res = await fetch(
      \`https://api.sharkapi.dev/v1/jobs/\${jobId}\`,
      { headers: { "Authorization": "Bearer sk_live_••••••••" } }
    );
    const job = await res.json();
    if (job.status === "complete") return job;
    if (job.status === "failed")   throw new Error("Job failed");
    await new Promise(r => setTimeout(r, 2000));
  }
}`,
    result: `const job = await waitForJob(job_id);

console.log(job.image_url);
// → "https://cdn.sharkapi.dev/out/job_8f2a9d3c.jpg"

console.log(job.cost);
// → "$0.02"`,
  },

  python: {
    request: `import httpx

response = httpx.post(
    "https://api.sharkapi.dev/v1/generate",
    headers={
        "Authorization": "Bearer sk_live_••••••••",
        "Content-Type": "application/json",
    },
    json={
        "mode": "2k",
        "prompt": "Deep ocean shark, cinematic lighting, 8K",
    },
)
job_id = response.json()["job_id"]`,
    poll: `import time

def wait_for_job(job_id: str) -> dict:
    headers = {"Authorization": "Bearer sk_live_••••••••"}
    url = f"https://api.sharkapi.dev/v1/jobs/{job_id}"

    while True:
        job = httpx.get(url, headers=headers).json()
        if job["status"] == "complete":
            return job
        if job["status"] == "failed":
            raise RuntimeError("Job failed")
        time.sleep(2)`,
    result: `job = wait_for_job(job_id)

print(job["image_url"])
# → "https://cdn.sharkapi.dev/out/job_8f2a9d3c.jpg"

print(job["cost"])
# → "$0.02"`,
  },
};

const RESULT_COLORS: Record<Lang, Record<Step, string>> = {
  curl:   { request: "text-electric-300", poll: "text-amber-300",   result: "text-aqua-300" },
  js:     { request: "text-electric-300", poll: "text-amber-300",   result: "text-aqua-300" },
  python: { request: "text-electric-300", poll: "text-amber-300",   result: "text-aqua-300" },
};

const STEPS: Step[] = ["request", "poll", "result"];

export function CodeExamples() {
  const t = useTranslations("codeExamples");
  const [lang, setLang]       = useState<Lang>("curl");
  const [step, setStep]       = useState<Step>("request");
  const [copied, setCopied]   = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE[lang][step]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const LANGS: { key: Lang; label: string }[] = [
    { key: "curl",   label: t("tabs.curl") },
    { key: "js",     label: t("tabs.js")   },
    { key: "python", label: t("tabs.python") },
  ];

  const STEP_LABELS: Record<Step, string> = {
    request: t("stepLabels.request"),
    poll:    t("stepLabels.poll"),
    result:  t("stepLabels.result"),
  };

  return (
    <section className="bg-ocean-900 py-24 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(0,174,239,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="info" className="mb-4">{t("badge")}</Badge>
          <h2 className="text-4xl font-bold text-ocean-50 mb-4">{t("title")}</h2>
          <p className="text-ocean-200 max-w-xl mx-auto">{t("subtitle")}</p>
        </div>

        {/* Code panel */}
        <Card variant="bordered" padding="none" className="overflow-hidden">

          {/* Top bar: language tabs */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ocean-500/30 bg-ocean-900/60 flex-wrap gap-2">
            <div className="flex gap-1">
              {LANGS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setLang(key)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md transition-all duration-150",
                    lang === key
                      ? "bg-electric-400/20 text-electric-400 border border-electric-400/40"
                      : "text-ocean-300 hover:text-ocean-100 hover:bg-ocean-600/40"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCopy}
              className={cn(
                "text-xs px-3 py-1 rounded-md border transition-all duration-150",
                copied
                  ? "border-aqua-400/40 text-aqua-400 bg-aqua-400/10"
                  : "border-ocean-500/40 text-ocean-300 hover:text-ocean-100 hover:border-ocean-400/60"
              )}
            >
              {copied ? t("copiedLabel") : t("copyLabel")}
            </button>
          </div>

          {/* Step selector */}
          <div className="flex border-b border-ocean-500/20 bg-ocean-800/30">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={cn(
                  "flex-1 py-2.5 text-xs font-medium transition-all duration-150 relative",
                  step === s
                    ? "text-electric-400"
                    : "text-ocean-400 hover:text-ocean-200",
                  i > 0 && "border-l border-ocean-500/20"
                )}
              >
                {step === s && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-400" />
                )}
                <span className="mr-1.5 text-ocean-500">
                  {i + 1}.
                </span>
                {STEP_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Code content */}
          <div className="relative">
            {/* Terminal dots */}
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-coral-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-aqua-400/60" />
            </div>
            <pre
              className={cn(
                "px-4 pb-5 pt-2 text-xs font-mono overflow-x-auto leading-relaxed min-h-[160px]",
                RESULT_COLORS[lang][step]
              )}
            >
              {CODE[lang][step]}
            </pre>
          </div>
        </Card>

        {/* Step progress dots */}
        <div className="flex justify-center gap-2 mt-5">
          {STEPS.map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                step === s
                  ? "bg-electric-400 scale-125"
                  : "bg-ocean-500 hover:bg-ocean-300"
              )}
              aria-label={STEP_LABELS[s]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
