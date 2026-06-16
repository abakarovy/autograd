export type Car = {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  engine_volume: number;
  description: string;
  image_url: string;
  available: boolean;
};

export type PaginatedCars = {
  items: Car[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
};

export type Client = {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  passport_number: string;
};

export type Sale = {
  id: number;
  car_id: number;
  client_id: number;
  sale_date: string;
  final_price: number;
  car?: Car | null;
  client?: Client | null;
};
