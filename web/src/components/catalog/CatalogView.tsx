"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { clientApi, fetchBrands } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";
import type { Car, PaginatedCars } from "@/lib/types";

const PER_PAGE = 12;

export function CatalogView() {
  const [brands, setBrands] = useState<string[]>([]);
  const [data, setData] = useState<PaginatedCars | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [minP, setMinP] = useState("");
  const [maxP, setMaxP] = useState("");
  const [year, setYear] = useState("");
  const [sort, setSort] = useState("price_asc");
  const [page, setPage] = useState(1);

  const load = useCallback(
    async (p: number, signal?: AbortSignal) => {
      setLoading(true);
      setErr(null);
      const params = new URLSearchParams();
      params.set("page", String(p));
      params.set("per_page", String(PER_PAGE));
      if (search.trim()) params.set("search", search.trim());
      if (brand) params.set("brand", brand);
      if (minP) params.set("min_price", minP);
      if (maxP) params.set("max_price", maxP);
      if (year) params.set("year", year);
      if (sort) params.set("sort", sort);
      try {
        const res = await clientApi<PaginatedCars>(`/cars?${params.toString()}`, { signal });
        setData(res);
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setErr(e instanceof Error ? e.message : "Ошибка загрузки");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [search, brand, minP, maxP, year, sort],
  );

  useEffect(() => {
    fetchBrands()
      .then(setBrands)
      .catch(() => setBrands([]));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, brand, minP, maxP, year, sort]);

  useEffect(() => {
    const ac = new AbortController();
    const t = setTimeout(() => {
      void load(page, ac.signal);
    }, 280);
    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [page, load]);

  const items = data?.items ?? [];

  return (
    <div className="mt-10">
      <div className="rounded-2xl border border-frost-200 bg-ink-850/50 p-4 shadow-card backdrop-blur-md sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <label className="block sm:col-span-2 xl:col-span-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Поиск</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Марка или модель…"
              className="mt-1.5 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent/50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Марка</span>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2.5 text-sm text-white focus:border-accent/50"
            >
              <option value="">Все марки</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Цена от</span>
            <input
              type="number"
              min={0}
              value={minP}
              onChange={(e) => setMinP(e.target.value)}
              placeholder="0"
              className="mt-1.5 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent/50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Цена до</span>
            <input
              type="number"
              min={0}
              value={maxP}
              onChange={(e) => setMaxP(e.target.value)}
              placeholder="∞"
              className="mt-1.5 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent/50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Год</span>
            <input
              type="number"
              min={1990}
              max={2035}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Любой"
              className="mt-1.5 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent/50"
            />
          </label>
          <label className="block sm:col-span-2 lg:col-span-1 xl:col-span-1">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Сортировка</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2.5 text-sm text-white focus:border-accent/50"
            >
              <option value="price_asc">Сначала дешёвые</option>
              <option value="price_desc">Сначала дорогие</option>
              <option value="year_desc">Сначала новые</option>
              <option value="year_asc">Сначала старые</option>
              <option value="brand_asc">По марке (А–Я)</option>
            </select>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-frost-200 border-t-accent" />
        </div>
      ) : err ? (
        <p className="mt-12 text-center text-sm text-red-400">{err}</p>
      ) : items.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-frost-300 bg-ink-900/30 py-16 text-center">
          <p className="text-lg font-medium text-white">Ничего не найдено</p>
          <p className="mt-2 text-sm text-zinc-500">Измените фильтры или поисковый запрос.</p>
        </div>
      ) : (
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((car, i) => (
            <CarGridCard key={car.id} car={car} index={i} />
          ))}
        </ul>
      )}

      {data && data.pages > 1 ? (
        <nav className="mt-12 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-frost-200 px-4 py-2 text-sm text-zinc-300 disabled:opacity-40 hover:bg-frost-100"
          >
            Назад
          </button>
          {(() => {
            const maxV = 5;
            const start = Math.max(1, page - Math.floor(maxV / 2));
            const end = Math.min(data.pages, start + maxV - 1);
            const s = Math.max(1, end - maxV + 1);
            const buttons = [];
            for (let n = s; n <= end; n++) {
              buttons.push(
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`min-w-[2.5rem] rounded-lg px-3 py-2 text-sm font-medium ${
                    n === page
                      ? "bg-accent text-white shadow-glow"
                      : "border border-frost-200 text-zinc-400 hover:bg-frost-100"
                  }`}
                >
                  {n}
                </button>,
              );
            }
            return buttons;
          })()}
          <button
            type="button"
            disabled={page >= data.pages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-frost-200 px-4 py-2 text-sm text-zinc-300 disabled:opacity-40 hover:bg-frost-100"
          >
            Вперёд
          </button>
          <span className="ml-2 text-xs text-zinc-600">Всего: {data.total}</span>
        </nav>
      ) : null}
    </div>
  );
}

function CarGridCard({ car, index }: { car: Car; index: number }) {
  const isNew = car.mileage === 0;
  const fallback = `https://placehold.co/800x500/0f1118/5b7cff?text=${encodeURIComponent(car.brand)}`;
  const src = car.image_url ? resolveMediaUrl(car.image_url) : fallback;

  return (
    <li
      className="group motion-safe:animate-fadeUp overflow-hidden rounded-2xl border border-frost-200 bg-ink-850/40 shadow-card backdrop-blur-sm transition hover:border-accent/30 hover:shadow-glow"
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <Link href={`/car/${car.id}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-ink-900">
          <Image
            src={src}
            alt={`${car.brand} ${car.model}`}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            unoptimized
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src !== fallback) el.src = fallback;
            }}
          />
          <span
            className={`absolute left-3 top-3 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              isNew ? "bg-emerald-500/90 text-white" : "bg-zinc-900/85 text-zinc-200"
            }`}
          >
            {isNew ? "Новый" : "С пробегом"}
          </span>
        </div>
        <div className="p-4">
          <p className="text-base font-semibold text-white">
            {car.brand} {car.model}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{car.year} год</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-400">
            <span className="rounded-md bg-frost-100 px-2 py-0.5">{car.fuel_type}</span>
            <span className="rounded-md bg-frost-100 px-2 py-0.5">{car.transmission}</span>
            <span className="rounded-md bg-frost-100 px-2 py-0.5">{car.body_type}</span>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-lg font-semibold tabular-nums text-white">{formatPrice(car.price)}</span>
            <span className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white">Подробнее</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
