import { CatalogView } from "@/components/catalog/CatalogView";

export const metadata = {
  title: "Каталог",
  description: "Автомобили в наличии: фильтры, поиск, сортировка.",
};

export default function CatalogPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Каталог</h1>
        <p className="mt-2 text-sm text-zinc-500 sm:text-base">
          Данные загружаются из REST API автосалона в реальном времени.
        </p>
      </div>
      <CatalogView />
    </div>
  );
}
