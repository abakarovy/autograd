const LOCAL_API = "http://127.0.0.1:8000";
/** Продакшен FastAPI на Vercel */
const PRODUCTION_API = "https://autograd-f335.vercel.app";

function resolveApiUrl(): string {
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

/** Прямой URL FastAPI для SSR и API routes Next.js. */
export function getServerApiUrl(): string {
  return resolveApiUrl();
}

/** URL для fetch из браузера — напрямую на backend (CORS разрешён). */
export function getPublicApiUrl(): string {
  return resolveApiUrl();
}
