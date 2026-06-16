import { getPublicApiUrl } from "./env";
import type { Car, Client, PaginatedCars, Sale } from "./types";

const JSON_HDR = { "Content-Type": "application/json" };

async function parseJson<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail)
          ? data.detail.map((d: { msg?: string }) => d.msg).join(", ")
          : `Ошибка ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function fetchCars(
  searchParams: URLSearchParams,
  init?: RequestInit,
): Promise<PaginatedCars> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/cars?${searchParams.toString()}`, {
    ...init,
    cache: init?.cache ?? "no-store",
  });
  return parseJson<PaginatedCars>(res);
}

export async function fetchCar(id: number, init?: RequestInit): Promise<Car> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/cars/${id}`, {
    ...init,
    cache: init?.cache ?? "no-store",
  });
  return parseJson<Car>(res);
}

export async function fetchBrands(init?: RequestInit): Promise<string[]> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/cars/brands`, {
    ...init,
    cache: init?.cache ?? "no-store",
  });
  return parseJson<string[]>(res);
}

export async function fetchClients(init?: RequestInit): Promise<Client[]> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/clients`, {
    ...init,
    cache: init?.cache ?? "no-store",
  });
  return parseJson<Client[]>(res);
}

export async function fetchSales(init?: RequestInit): Promise<Sale[]> {
  const base = getPublicApiUrl();
  const res = await fetch(`${base}/sales`, {
    ...init,
    cache: init?.cache ?? "no-store",
  });
  return parseJson<Sale[]>(res);
}

export async function clientApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const base = getPublicApiUrl();
  const headers = new Headers(options.headers);
  if (
    options.body &&
    typeof options.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${base}${path}`, { ...options, headers });
  return parseJson<T>(res);
}

export { JSON_HDR };
