"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { clientApi } from "@/lib/api";
import { getPublicApiUrl } from "@/lib/env";
import { formatPrice } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";
import type { Car, Client, PaginatedCars, Sale } from "@/lib/types";

type Tab = "cars" | "clients" | "sales";

type CarForm = {
  id?: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  engine_volume: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  image_url: string;
  description: string;
  available: boolean;
};

function emptyForm(): CarForm {
  const y = new Date().getFullYear();
  return {
    brand: "",
    model: "",
    year: y,
    price: 0,
    mileage: 0,
    engine_volume: 2,
    fuel_type: "Бензин",
    transmission: "Автомат",
    body_type: "Седан",
    color: "Белый",
    image_url: "",
    description: "",
    available: true,
  };
}

function carToForm(c: Car): CarForm {
  return {
    id: c.id,
    brand: c.brand,
    model: c.model,
    year: c.year,
    price: c.price,
    mileage: c.mileage,
    engine_volume: c.engine_volume,
    fuel_type: c.fuel_type,
    transmission: c.transmission,
    body_type: c.body_type,
    color: c.color,
    image_url: c.image_url || "",
    description: c.description || "",
    available: c.available,
  };
}

async function uploadCarPhoto(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${getPublicApiUrl()}/upload/car-photo`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(typeof j.detail === "string" ? j.detail : "Ошибка загрузки");
  }
  const j = (await res.json()) as { url: string };
  return j.url;
}

export function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("cars");

  const [cars, setCars] = useState<Car[]>([]);
  const [totalCars, setTotalCars] = useState<number | null>(null);
  const [loadingCars, setLoadingCars] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const [form, setForm] = useState<CarForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);

  const loadCars = useCallback(async () => {
    setLoadingCars(true);
    try {
      const d = await clientApi<PaginatedCars>("/cars?per_page=50&available_only=false");
      setCars(d.items);
      setTotalCars(d.total);
    } catch {
      setCars([]);
      setTotalCars(null);
    } finally {
      setLoadingCars(false);
    }
  }, []);

  const loadClients = useCallback(async () => {
    setLoadingClients(true);
    try {
      setClients(await clientApi<Client[]>("/clients"));
    } catch {
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const loadSales = useCallback(async () => {
    setLoadingSales(true);
    try {
      setSales(await clientApi<Sale[]>("/sales"));
    } catch {
      setSales([]);
    } finally {
      setLoadingSales(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "cars") void loadCars();
  }, [tab, loadCars]);

  useEffect(() => {
    if (tab === "clients") void loadClients();
  }, [tab, loadClients]);

  useEffect(() => {
    if (tab === "sales") void loadSales();
  }, [tab, loadSales]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function onSaveCar(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.brand.trim() || !form.model.trim()) return;
    setSaving(true);
    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: form.year,
      price: form.price,
      mileage: form.mileage,
      engine_volume: form.engine_volume,
      fuel_type: form.fuel_type,
      transmission: form.transmission,
      body_type: form.body_type,
      color: form.color.trim(),
      image_url: form.image_url.trim(),
      description: form.description.trim(),
    };
    try {
      if (form.id) {
        await clientApi(`/cars/${form.id}`, {
          method: "PUT",
          body: JSON.stringify({ ...payload, available: form.available }),
        });
      } else {
        await clientApi("/cars", { method: "POST", body: JSON.stringify(payload) });
      }
      setForm(null);
      void loadCars();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteCar(id: number) {
    if (!confirm(`Удалить автомобиль №${id}?`)) return;
    try {
      await clientApi(`/cars/${id}`, { method: "DELETE" });
      void loadCars();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  }

  const preview = form?.image_url?.trim()
    ? resolveMediaUrl(form.image_url.trim())
    : "";

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-frost-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Админ-панель</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Управление каталогом</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Карточки и фото синхронизируются с API автосалона — изменения сразу видны на публичном сайте.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/catalog"
            className="rounded-xl border border-frost-200 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-accent/40 hover:text-white"
          >
            Открыть каталог
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-xl border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="mt-8 inline-flex rounded-xl border border-frost-200 bg-ink-900/50 p-1">
        {(
          [
            ["cars", "Автомобили"],
            ["clients", "Клиенты"],
            ["sales", "Продажи"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === k ? "bg-accent text-white shadow-glow" : "text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "cars" ? (
        <section className="mt-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              В базе:{" "}
              <span className="font-semibold tabular-nums text-white">
                {totalCars ?? (loadingCars ? "…" : "—")}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setForm(emptyForm())}
              className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-accent-soft"
            >
              + Добавить автомобиль
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-frost-200 bg-ink-850/40 shadow-card">
            {loadingCars ? (
              <div className="flex justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-frost-200 border-t-accent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-frost-200 bg-ink-950/40 text-xs uppercase tracking-wide text-zinc-500">
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Фото</th>
                      <th className="px-4 py-3">Марка</th>
                      <th className="px-4 py-3">Модель</th>
                      <th className="px-4 py-3">Год</th>
                      <th className="px-4 py-3">Цена</th>
                      <th className="px-4 py-3">Статус</th>
                      <th className="px-4 py-3">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((c) => {
                      const fb = `https://placehold.co/120x72/0f1118/5b7cff?text=${encodeURIComponent(c.brand)}`;
                      const thumb = c.image_url ? resolveMediaUrl(c.image_url) : fb;
                      return (
                        <tr key={c.id} className="border-b border-frost-100/40 text-zinc-300">
                          <td className="px-4 py-3 font-mono text-xs text-zinc-500">{c.id}</td>
                          <td className="px-4 py-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={thumb}
                              alt=""
                              className="h-11 w-[4.5rem] rounded-lg border border-frost-200 bg-ink-950 object-cover"
                              onError={(e) => {
                                const el = e.currentTarget;
                                if (el.src !== fb) el.src = fb;
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 text-white">{c.brand}</td>
                          <td className="px-4 py-3">{c.model}</td>
                          <td className="px-4 py-3 tabular-nums">{c.year}</td>
                          <td className="px-4 py-3 tabular-nums text-white">{formatPrice(c.price)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={
                                c.available ? "font-medium text-emerald-400" : "font-medium text-red-400"
                              }
                            >
                              {c.available ? "В наличии" : "Продан"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => setForm(carToForm(c))}
                                className="rounded-lg border border-frost-200 px-3 py-1 text-xs hover:border-accent/50 hover:text-white"
                              >
                                Изменить
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteCar(c.id)}
                                className="rounded-lg border border-red-500/25 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                              >
                                Удалить
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {cars.length === 0 ? (
                  <p className="py-12 text-center text-sm text-zinc-500">Нет автомобилей в базе</p>
                ) : null}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {tab === "clients" ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-frost-200 bg-ink-850/40 shadow-card">
          {loadingClients ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-frost-200 border-t-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-frost-200 bg-ink-950/40 text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Имя</th>
                    <th className="px-4 py-3">Фамилия</th>
                    <th className="px-4 py-3">Телефон</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Паспорт</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-b border-frost-100/40 text-zinc-300">
                      <td className="px-4 py-3 font-mono text-xs text-zinc-500">{c.id}</td>
                      <td className="px-4 py-3 text-white">{c.first_name}</td>
                      <td className="px-4 py-3">{c.last_name}</td>
                      <td className="px-4 py-3">{c.phone}</td>
                      <td className="px-4 py-3">{c.email || "—"}</td>
                      <td className="px-4 py-3">{c.passport_number || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {tab === "sales" ? (
        <section className="mt-8 overflow-hidden rounded-2xl border border-frost-200 bg-ink-850/40 shadow-card">
          {loadingSales ? (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-frost-200 border-t-accent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-frost-200 bg-ink-950/40 text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Автомобиль</th>
                    <th className="px-4 py-3">Клиент</th>
                    <th className="px-4 py-3">Дата</th>
                    <th className="px-4 py-3">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((s) => {
                    const carName = s.car ? `${s.car.brand} ${s.car.model}` : `Авто #${s.car_id}`;
                    const clientName = s.client
                      ? `${s.client.first_name} ${s.client.last_name}`
                      : `Клиент #${s.client_id}`;
                    const dt = new Date(s.sale_date).toLocaleString("ru-RU");
                    return (
                      <tr key={s.id} className="border-b border-frost-100/40 text-zinc-300">
                        <td className="px-4 py-3 font-mono text-xs text-zinc-500">{s.id}</td>
                        <td className="px-4 py-3 text-white">{carName}</td>
                        <td className="px-4 py-3">{clientName}</td>
                        <td className="px-4 py-3 text-xs text-zinc-500">{dt}</td>
                        <td className="px-4 py-3 tabular-nums text-white">{formatPrice(s.final_price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {form ? (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal
          onClick={(e) => e.target === e.currentTarget && setForm(null)}
        >
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-frost-200 bg-ink-900 p-6 shadow-card sm:p-8">
            <button
              type="button"
              className="float-right text-2xl leading-none text-zinc-500 hover:text-white"
              aria-label="Закрыть"
              onClick={() => setForm(null)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold text-white">{form.id ? "Редактирование" : "Новая карточка"}</h2>
            <p className="mt-1 text-sm text-zinc-500">Данные сохраняются в REST API и отображаются в каталоге.</p>

            <form className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]" onSubmit={onSaveCar}>
              <div className="space-y-4">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-frost-200 bg-ink-950">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-zinc-600">
                      Превью фото
                    </div>
                  )}
                </div>
                <label
                  htmlFor="admin-car-photo"
                  className="block cursor-pointer rounded-xl border border-dashed border-accent/40 bg-accent/5 px-4 py-6 text-center text-sm text-zinc-400"
                >
                  <input
                    id="admin-car-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={uploadBusy}
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      setUploadBusy(true);
                      try {
                        const url = await uploadCarPhoto(f);
                        setForm((prev) => (prev ? { ...prev, image_url: url } : prev));
                      } catch (err) {
                        alert(err instanceof Error ? err.message : "Ошибка загрузки");
                      } finally {
                        setUploadBusy(false);
                      }
                    }}
                  />
                  <span className="font-medium text-accent">{uploadBusy ? "Загрузка…" : "Загрузить фото"}</span>
                  <span className="mt-2 block text-xs text-zinc-600">JPEG, PNG, WebP, GIF · до 8 МБ</span>
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-500">URL изображения</span>
                  <input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-xs text-white"
                    placeholder="/media/cars/... или https://"
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-zinc-500">Марка *</span>
                    <input
                      required
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-zinc-500">Модель *</span>
                    <input
                      required
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-zinc-500">Год *</span>
                    <input
                      type="number"
                      required
                      min={1900}
                      max={2035}
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: parseInt(e.target.value, 10) || 0 })}
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-zinc-500">Цена (₽) *</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1000}
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-zinc-500">Пробег</span>
                    <input
                      type="number"
                      min={0}
                      value={form.mileage}
                      onChange={(e) => setForm({ ...form, mileage: parseInt(e.target.value, 10) || 0 })}
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="text-sm">
                    <span className="text-zinc-500">Объём двигателя (л)</span>
                    <input
                      type="number"
                      step={0.1}
                      min={0.1}
                      value={form.engine_volume}
                      onChange={(e) =>
                        setForm({ ...form, engine_volume: parseFloat(e.target.value) || 0.1 })
                      }
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-zinc-500">Топливо</span>
                    <select
                      value={form.fuel_type}
                      onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    >
                      {["Бензин", "Дизель", "Гибрид", "Электро", "Газ"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="text-zinc-500">КПП</span>
                    <select
                      value={form.transmission}
                      onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    >
                      {["Автомат", "Механика", "Робот", "Вариатор"].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm">
                    <span className="text-zinc-500">Кузов</span>
                    <select
                      value={form.body_type}
                      onChange={(e) => setForm({ ...form, body_type: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    >
                      {[
                        "Седан",
                        "Кроссовер",
                        "Внедорожник",
                        "Хэтчбек",
                        "Универсал",
                        "Купе",
                        "Минивэн",
                        "Пикап",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    <span className="text-zinc-500">Цвет</span>
                    <input
                      value={form.color}
                      onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                    />
                  </label>
                </div>
                {form.id ? (
                  <label className="flex cursor-pointer items-center gap-3 text-sm text-zinc-300">
                    <input
                      type="checkbox"
                      checked={form.available}
                      onChange={(e) => setForm({ ...form, available: e.target.checked })}
                      className="h-4 w-4 rounded border-frost-200 accent-accent"
                    />
                    В наличии (показывать в каталоге)
                  </label>
                ) : null}
                <label className="block text-sm">
                  <span className="text-zinc-500">Описание</span>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 w-full resize-y rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white hover:bg-accent-soft disabled:opacity-50"
                >
                  {saving ? "Сохранение…" : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
