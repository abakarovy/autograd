import { notFound } from "next/navigation";
import { CarDetailView } from "@/components/car/CarDetailView";
import { fetchCar } from "@/lib/api";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const n = parseInt(id, 10);
  if (Number.isNaN(n)) return { title: "Автомобиль" };
  try {
    const car = await fetchCar(n);
    return { title: `${car.brand} ${car.model}` };
  } catch {
    return { title: "Автомобиль" };
  }
}

export default async function CarPage({ params }: Props) {
  const { id } = await params;
  const n = parseInt(id, 10);
  if (Number.isNaN(n)) notFound();

  let car;
  try {
    car = await fetchCar(n);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8 lg:pt-14">
      <CarDetailView initialCar={car} />
    </div>
  );
}
