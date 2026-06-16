import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-frost-200/80 bg-ink-900/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-2">
          <p className="text-lg font-semibold text-white">
            Авто<span className="text-accent">Град</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
            Премиальный автосалон: прозрачные условия, проверенные автомобили и сервис на каждом этапе сделки.
          </p>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Навигация</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/" className="text-zinc-400 hover:text-white">
                Главная
              </Link>
            </li>
            <li>
              <Link href="/catalog" className="text-zinc-400 hover:text-white">
                Каталог
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="text-zinc-400 hover:text-white">
                Контакты
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="text-zinc-400 hover:text-white">
                Вход для администратора
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Контакты</h4>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            <li>
              <a href="tel:+78001234567" className="hover:text-white">
                8 (800) 123-45-67
              </a>
            </li>
            <li>
              <a href="mailto:info@autograd.ru" className="hover:text-white">
                info@autograd.ru
              </a>
            </li>
            <li>Москва, ул. Автомобильная, 1</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-frost-100/50 py-6 text-center text-xs text-zinc-600">
        © 2024—2026 АвтоГрад · дипломный проект
      </div>
    </footer>
  );
}
