"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const flagMap: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  rw: "🇷🇼",
};

const labelMap: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  rw: "Kinyarwanda",
};

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("language");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function switchLocale(next: Locale) {
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        title={t("select")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium transition-all",
          "hover:border-[var(--color-border)] hover:bg-[var(--color-neutral-100)]",
          "text-[var(--color-neutral-500)] hover:text-[var(--color-foreground)]"
        )}
      >
        <Globe className="h-3.5 w-3.5 flex-shrink-0" />
        {!compact && (
          <span className="hidden sm:inline">{flagMap[locale]} {labelMap[locale]}</span>
        )}
        {compact && <span>{flagMap[locale]}</span>}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-40 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg z-50 overflow-hidden">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLocale(loc as Locale)}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left",
                locale === loc
                  ? "bg-[var(--color-primary-50)] text-[var(--color-primary)] font-semibold"
                  : "hover:bg-[var(--color-neutral-100)] text-[var(--color-foreground)]"
              )}
            >
              <span className="text-base leading-none">{flagMap[loc as Locale]}</span>
              <span>{labelMap[loc as Locale]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
