from sqlalchemy.orm import Session
from sqlalchemy import or_
import math

from models import Car, Client, Sale
from schemas import CarCreate, CarUpdate, ClientCreate, ClientUpdate, SaleCreate


# ═══════════════════════════════════════════════════════════════════
#  CRUD — Автомобили
# ═══════════════════════════════════════════════════════════════════

def get_cars(
    db: Session,
    page: int = 1,
    per_page: int = 12,
    brand: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    year: int | None = None,
    search: str | None = None,
    sort: str = "price_asc",
    available_only: bool = True,
):
    """Получение списка автомобилей с фильтрацией, поиском, сортировкой и пагинацией."""
    query = db.query(Car)

    if available_only:
        query = query.filter(Car.available == True)
    if brand:
        query = query.filter(Car.brand.ilike(f"%{brand}%"))
    if min_price is not None:
        query = query.filter(Car.price >= min_price)
    if max_price is not None:
        query = query.filter(Car.price <= max_price)
    if year:
        query = query.filter(Car.year == year)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Car.brand.ilike(pattern),
                Car.model.ilike(pattern),
                Car.description.ilike(pattern),
            )
        )

    sort_map = {
        "price_asc": Car.price.asc(),
        "price_desc": Car.price.desc(),
        "year_asc": Car.year.asc(),
        "year_desc": Car.year.desc(),
        "brand_asc": Car.brand.asc(),
    }
    query = query.order_by(sort_map.get(sort, Car.price.asc()))

    total = query.count()
    pages = max(1, math.ceil(total / per_page))
    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


def get_car(db: Session, car_id: int) -> Car | None:
    return db.query(Car).filter(Car.id == car_id).first()


def create_car(db: Session, data: CarCreate) -> Car:
    car = Car(**data.model_dump())
    db.add(car)
    db.commit()
    db.refresh(car)
    return car


def update_car(db: Session, car_id: int, data: CarUpdate) -> Car | None:
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(car, key, value)
    db.commit()
    db.refresh(car)
    return car


def delete_car(db: Session, car_id: int) -> bool:
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        return False
    db.delete(car)
    db.commit()
    return True


def get_brands(db: Session) -> list[str]:
    """Список уникальных марок для фильтра."""
    rows = db.query(Car.brand).distinct().order_by(Car.brand).all()
    return [r[0] for r in rows]


# ═══════════════════════════════════════════════════════════════════
#  CRUD — Клиенты
# ═══════════════════════════════════════════════════════════════════

def get_clients(db: Session, skip: int = 0, limit: int = 100) -> list[Client]:
    return db.query(Client).offset(skip).limit(limit).all()


def get_client(db: Session, client_id: int) -> Client | None:
    return db.query(Client).filter(Client.id == client_id).first()


def create_client(db: Session, data: ClientCreate) -> Client:
    client = Client(**data.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    return client


def update_client(db: Session, client_id: int, data: ClientUpdate) -> Client | None:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return None
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(client, key, value)
    db.commit()
    db.refresh(client)
    return client


def delete_client(db: Session, client_id: int) -> bool:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return False
    db.delete(client)
    db.commit()
    return True


# ═══════════════════════════════════════════════════════════════════
#  CRUD — Продажи
# ═══════════════════════════════════════════════════════════════════

def get_sales(db: Session, skip: int = 0, limit: int = 100) -> list[Sale]:
    return db.query(Sale).offset(skip).limit(limit).all()


def get_sale(db: Session, sale_id: int) -> Sale | None:
    return db.query(Sale).filter(Sale.id == sale_id).first()


def create_sale(db: Session, data: SaleCreate) -> Sale:
    """
    Создаёт продажу:
    1. Проверяет существование автомобиля и клиента
    2. Помечает автомобиль как проданный (available=False)
    3. Записывает продажу в таблицу sales
    """
    sale = Sale(
        car_id=data.car_id,
        client_id=data.client_id,
        final_price=data.final_price,
    )
    db.add(sale)

    car = db.query(Car).filter(Car.id == data.car_id).first()
    if car:
        car.available = False

    db.commit()
    db.refresh(sale)
    return sale
