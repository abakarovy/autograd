import { getPublicApiUrl } from "./env";

/** Собирает полный URL для картинки каталога (внешняя ссылка или /media/... с API). */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url || !String(url).trim()) return "";
  const u = String(url).trim();
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return u;
  const base = getPublicApiUrl();
  if (u.startsWith("/")) return `${base}${u}`;
  return `${base}/${u}`;
}
