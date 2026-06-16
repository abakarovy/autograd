import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-32 text-center">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">Страница не найдена</h1>
      <p className="mt-2 text-sm text-zinc-500">Проверьте адрес или вернитесь в каталог.</p>
      <Link
        href="/catalog"
        className="mt-8 inline-flex rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow hover:bg-accent-soft"
      >
        В каталог
      </Link>
    </div>
  );
}
