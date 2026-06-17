import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Контакты",
  description: "АвтоГрад: телефон, email, адрес автосалона и режим работы.",
};

type ContactLine = {
  label: string;
  value: string;
  href?: string;
};

const blocks: { title: string; lines: ContactLine[] }[] = [
  {
    title: "Телефон",
    lines: [
      { label: "Бесплатно по России", value: "8 (800) 123-45-67", href: "tel:+78001234567" },
      { label: "Москва", value: "+7 (495) 000-00-00", href: "tel:+74950000000" },
    ],
  },
  {
    title: "Электронная почта",
    lines: [{ label: "Общие вопросы", value: "info@autograd.ru", href: "mailto:info@autograd.ru" }],
  },
  {
    title: "Адрес",
    lines: [
      {
        label: "Автосалон",
        value: "г. Москва, ул. Автомобильная, 1",
        href: "https://yandex.ru/maps/",
      },
    ],
  },
  {
    title: "Режим работы",
    lines: [
      { label: "Пн — Пт", value: "9:00 — 21:00" },
      { label: "Суббота", value: "10:00 — 20:00" },
      { label: "Воскресенье", value: "10:00 — 18:00" },
    ],
  },
];

export default function ContactsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Связь с нами</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Контакты</h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-zinc-500 sm:text-base">
          Звоните, пишите или приезжайте в шоурум — подберём автомобиль и ответим на вопросы по сделке и сервису.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {blocks.map((b) => (
          <section
            key={b.title}
            className="rounded-2xl border border-frost-200 bg-ink-850/50 p-6 shadow-card backdrop-blur-sm"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{b.title}</h2>
            <ul className="mt-4 space-y-4">
              {b.lines.map((line, i) => (
                <li key={i}>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-600">{line.label}</p>
                  {line.href ? (
                    <a
                      href={line.href}
                      className="mt-1 inline-block text-sm font-medium text-white underline decoration-frost-300 underline-offset-4 transition hover:text-accent hover:decoration-accent/60"
                      {...(line.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {line.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-medium text-zinc-200">{line.value}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-frost-200 bg-ink-900/40 p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-white">Как добраться</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
          От станции метро «Автозаводская» — 12 минут пешком или 5 минут на такси. У здания есть гостевая парковка и
          зарядка для электромобилей.
        </p>
        <p className="mt-4 text-xs text-zinc-600">
          Карта для ориентира: ссылка на Яндекс.Карты в блоке «Адрес» — при необходимости замените на точные координаты
          вашего салона.
        </p>
      </div>
    </div>
  );
}
