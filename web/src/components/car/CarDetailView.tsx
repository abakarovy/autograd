"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { clientApi } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { resolveMediaUrl } from "@/lib/media";
import type { Car } from "@/lib/types";

export function CarDetailView({ initialCar }: { initialCar: Car }) {
  const [car, setCar] = useState(initialCar);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [passport, setPassport] = useState("");

  const fallback = `https://placehold.co/960x600/0f1118/5b7cff?text=${encodeURIComponent(car.brand)}`;
  const img = car.image_url ? resolveMediaUrl(car.image_url) : fallback;

  const specs = [
    { label: "Пробег", value: car.mileage === 0 ? "Новый" : `${car.mileage.toLocaleString("ru-RU")} км` },
    { label: "Двигатель", value: `${car.engine_volume} л` },
    { label: "Топливо", value: car.fuel_type },
    { label: "КПП", value: car.transmission },
    { label: "Кузов", value: car.body_type },
    { label: "Цвет", value: car.color },
  ];

  async function onBuy(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) return;
    setBusy(true);
    try {
      const client = await clientApi<{ id: number }>("/clients", {
        method: "POST",
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          passport_number: passport.trim(),
        }),
      });
      await clientApi("/sales", {
        method: "POST",
        body: JSON.stringify({
          car_id: car.id,
          client_id: client.id,
          final_price: car.price,
        }),
      });
      setCar((c) => ({ ...c, available: false }));
      setOpen(false);
      setFirstName("");
      setLastName("");
      setPhone("");
      setEmail("");
      setPassport("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка оформления");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link
        href="/catalog"
        className="inline-flex items-center gap-2 rounded-xl border border-frost-200 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-accent/40 hover:text-white"
      >
        ← В каталог
      </Link>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div className="overflow-hidden rounded-2xl border border-frost-200 bg-ink-900/50 shadow-card">
          <div className="relative aspect-[16/10] w-full bg-ink-950">
            <Image
              src={img}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover"
              sizes="(max-width:1024px) 100vw, 55vw"
              priority
              unoptimized
              onError={(e) => {
                const el = e.currentTarget;
                if (el.src !== fallback) el.src = fallback;
              }}
            />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {car.brand} {car.model}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{car.year} год</p>
          <p className="mt-6 text-3xl font-semibold tabular-nums text-white">{formatPrice(car.price)}</p>

          <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {specs.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-frost-200/80 bg-ink-850/40 px-3 py-3 backdrop-blur-sm"
              >
                <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{s.label}</dt>
                <dd className="mt-1 text-sm font-medium text-zinc-100">{s.value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-sm leading-relaxed text-zinc-400">
            {car.description?.trim() || "Описание появится после добавления в админ-панели."}
          </p>

          <button
            type="button"
            disabled={!car.available}
            onClick={() => car.available && setOpen(true)}
            className="mt-10 w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-45"
          >
            {car.available ? "Оформить покупку" : "Автомобиль продан"}
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-frost-200 bg-ink-900 p-6 shadow-card">
            <button
              type="button"
              className="absolute right-4 top-4 text-2xl leading-none text-zinc-500 hover:text-white"
              aria-label="Закрыть"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
            <h2 className="text-lg font-semibold text-white">Оформление покупки</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {car.brand} {car.model} — {formatPrice(car.price)}
            </p>
            <form className="mt-6 space-y-4" onSubmit={onBuy}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-zinc-500">Имя *</span>
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-zinc-500">Фамилия *</span>
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="text-zinc-500">Телефон *</span>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-500">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-500">Паспорт</span>
                <input
                  value={passport}
                  onChange={(e) => setPassport(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-frost-200 bg-ink-950/60 px-3 py-2 text-white"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white hover:bg-accent-soft disabled:opacity-50"
              >
                {busy ? "Отправка…" : "Подтвердить покупку"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
