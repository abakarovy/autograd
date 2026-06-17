const LOCAL_API = "http://127.0.0.1:8000";
/** Продакшен FastAPI на Vercel */
const PRODUCTION_API = "https://autograd-f335.vercel.app";

/** Прямой URL FastAPI — только на сервере Next.js (SSR, API routes). */
export function getServerApiUrl(): string {
  const fallback =
    process.env.VERCEL || process.env.NODE_ENV === "production"
      ? PRODUCTION_API
      : LOCAL_API;

  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    fallback
  ).replace(/\/$/, "");
}

/**
 * URL для fetch из браузера: same-origin прокси (без CORS).
 * На сервере — прямое подключение к backend.
 */
export function getPublicApiUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/backend";
  }
  return getServerApiUrl();
}
