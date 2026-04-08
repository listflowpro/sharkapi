import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { WaveDivider } from "@/components/effects/WaveDivider";
import { cn } from "@/lib/utils";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const sections = [
    {
      key: "product",
      links: [
        { key: "pricing",  href: `/pricing` },
        { key: "docs",     href: `/docs`    },
        { key: "trial",    href: `/trial`   },
        { key: "status",   href: `/status`  },
      ],
    },
    {
      key: "developers",
      links: [
        { key: "apiRef",    href: `/docs/api`        },
        { key: "auth",      href: `/docs/auth`       },
        { key: "generate",  href: `/docs/generate`   },
        { key: "jobStatus", href: `/docs/job-status` },
        { key: "errors",    href: `/docs/errors`     },
      ],
    },
    {
      key: "legal",
      links: [
        { key: "terms",   href: `/terms`   },
        { key: "privacy", href: `/privacy` },
        { key: "aup",     href: `/aup`     },
      ],
    },
    {
      key: "support",
      links: [
        { key: "contact", href: `/contact` },
        { key: "chat",    href: `/support`  },
      ],
    },
  ];

  return (
    <footer className="relative mt-auto">
      <WaveDivider variant="gentle" fillColor="#0B1929" className="-mb-1" />

      <div className="bg-ocean-800 border-t border-ocean-500/20 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-64 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(0,174,239,0.05) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
          aria-hidden="true"
        />

        {/* Watermark logo */}
        <div className="absolute bottom-4 right-8 pointer-events-none opacity-[0.05]" aria-hidden="true">
          <Image src="/logo.png" alt="" width={100} height={100} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">

            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3 group w-fit">
                <div className="relative w-8 h-8">
                  <Image src="/logo.png" alt="SharkApi.dev" fill sizes="32px" className="object-contain" />
                </div>
                <span className="text-base font-bold">
                  <span className="text-ocean-100">Shark</span>
                  <span className="text-electric-400">Api.dev</span>
                </span>
              </Link>
              <p className="text-xs text-ocean-300 leading-relaxed max-w-[200px]">
                {t("tagline")}
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="w-2 h-2 rounded-full bg-aqua-400 animate-pulse" />
                <span className="text-xs text-ocean-300">{t("status")}</span>
              </div>
            </div>

            {/* Link columns */}
            {sections.map((section) => (
              <div key={section.key}>
                <h3 className="text-xs font-semibold text-ocean-100 uppercase tracking-wider mb-3">
                  {t(`sections.${section.key}`)}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className={cn(
                          "text-sm text-ocean-300 hover:text-electric-400",
                          "transition-colors duration-150"
                        )}
                      >
                        {t(`links.${link.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-ocean-500/20 space-y-4">
            {/* Address + card logos row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-ocean-500 leading-relaxed">
                <span className="text-ocean-400 font-medium">FLUXNEXUS LLC</span>
                {" · "}1209 Mountain Road Pl NE Ste 7236, Albuquerque, NM 87110, USA
              </p>
              {/* Accepted card logos */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-ocean-500 mr-1">We accept</span>
                {/* Visa */}
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-white text-[10px] font-black tracking-tight text-blue-800 leading-none h-6">VISA</span>
                {/* Mastercard */}
                <span className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded bg-white h-6">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 opacity-90" />
                  <span className="w-3.5 h-3.5 rounded-full bg-yellow-400 opacity-90 -ml-1.5" />
                </span>
                {/* Amex */}
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-600 text-[9px] font-black text-white tracking-tight leading-none h-6">AMEX</span>
                {/* Discover */}
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-orange-500 text-[9px] font-black text-white tracking-tight leading-none h-6">DISC</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-ocean-400">
                © {year} SharkApi.dev — Operated by FLUXNEXUS LLC. {t("copyright")}
              </p>
              <p className="text-xs text-ocean-400">{t("tagline2")}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
