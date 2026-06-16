import Link from "next/link";
import { fetchCars } from "@/lib/api";

export default async function HomePage() {
  let catalogTotal: number | null = null;
  try {
    const p = new URLSearchParams({ page: "1", per_page: "1" });
    const d = await fetchCars(p);
    catalogTotal = d.total;
  } catch {
    catalogTotal = null;
  }

  const statLabel =
    catalogTotal !== null ? `${catalogTotal}+` : "120+";

  return (
    <>
      <section className="relative overflow-hidden border-b border-frost-200/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(91,124,255,0.15),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-32 lg:pt-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-frost-200 bg-frost-100 px-3 py-1 text-xs font-medium uppercase tracking-widest text-zinc-400">
            Автосалон
            <span className="h-1 w-1 rounded-full bg-accent" />
            Москва
          </p>
          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Автомобиль
            <span className="bg-gradient-to-r from-accent via-accent-soft to-violet-400 bg-clip-text text-transparent">
              {" "}
              вашей мечты
            </span>
            <br />
            без компромиссов
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
            Каталог в реальном времени из базы АвтоГрад: фильтры, цены, карточки и оформление сделки — в одном
            интерфейсе.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-soft"
            >
              Смотреть каталог
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12h14M13 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
            <a
              href="#features"
              className="inline-flex rounded-xl border border-frost-300 px-6 py-3 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              Почему мы
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Почему выбирают <span className="text-accent">АвтоГрад</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 sm:text-base">
            Прозрачные условия, проверенные автомобили и сопровождение сделки.
          </p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { t: "Широкий выбор", d: "От городских седанов до премиальных кроссоверов — в актуальном каталоге на сайте.", icon: "◆" },
            { t: "Проверенное качество", d: "Юридическая чистота и диагностика по стандартам автосалона.", icon: "◇" },
            { t: "Честная цена", d: "Понятные условия без скрытых платежей — видно в карточке автомобиля.", icon: "○" },
            { t: "Быстрое оформление", d: "Оформление клиента и фиксация продажи в системе — в несколько шагов.", icon: "◎" },
            { t: "Сервис и гарантия", d: "Поддержка на этапе выбора и после покупки.", icon: "□" },
            { t: "Индивидуальный подход", d: "Подбор под задачи и бюджет — с вниманием к деталям.", icon: "■" },
          ].map((f) => (
            <article
              key={f.t}
              className="group rounded-2xl border border-frost-200 bg-ink-850/40 p-6 shadow-card backdrop-blur-sm transition hover:border-accent/25 hover:bg-ink-800/60"
            >
              <p className="font-mono text-xs text-accent/90">{f.icon}</p>
              <h3 className="mt-3 text-lg font-semibold text-white">{f.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{f.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-frost-200/60 bg-ink-900/35">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-frost-200/80 bg-ink-950/40 p-8 text-center">
            <p className="text-4xl font-semibold tabular-nums text-white sm:text-5xl">{statLabel}</p>
            <p className="mt-2 text-sm text-zinc-500">позиций в каталоге (API)</p>
          </div>
          <div className="rounded-2xl border border-frost-200/80 bg-ink-950/40 p-8 text-center">
            <p className="text-4xl font-semibold tabular-nums text-white sm:text-5xl">8 500+</p>
            <p className="mt-2 text-sm text-zinc-500">довольных клиентов</p>
          </div>
          <div className="rounded-2xl border border-frost-200/80 bg-ink-950/40 p-8 text-center">
            <p className="text-4xl font-semibold tabular-nums text-white sm:text-5xl">12</p>
            <p className="mt-2 text-sm text-zinc-500">лет на рынке</p>
          </div>
        </div>
      </section>
    </>
  );
}
