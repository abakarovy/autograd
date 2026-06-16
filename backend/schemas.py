from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


# ── Автомобили ──────────────────────────────────────────────────────

class CarBase(BaseModel):
    brand: str = Field(..., min_length=1, max_length=100, examples=["Toyota"])
    model: str = Field(..., min_length=1, max_length=100, examples=["Camry"])
    year: int = Field(..., ge=1900, le=2030, examples=[2024])
    price: float = Field(..., gt=0, examples=[3500000])
    mileage: int = Field(0, ge=0)
    fuel_type: str = Field("Бензин", max_length=50)
    transmission: str = Field("Автомат", max_length=50)
    body_type: str = Field("Седан", max_length=50)
    color: str = Field("Белый", max_length=50)
    engine_volume: float = Field(2.0, gt=0)
    description: str = Field("")
    image_url: str = Field("")


class CarCreate(CarBase):
    pass


class CarUpdate(BaseModel):
    brand: Optional[str] = Field(None, min_length=1, max_length=100)
    model: Optional[str] = Field(None, min_length=1, max_length=100)
    year: Optional[int] = Field(None, ge=1900, le=2030)
    price: Optional[float] = Field(None, gt=0)
    mileage: Optional[int] = Field(None, ge=0)
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    body_type: Optional[str] = None
    color: Optional[str] = None
    engine_volume: Optional[float] = Field(None, gt=0)
    description: Optional[str] = None
    image_url: Optional[str] = None
    available: Optional[bool] = None


class CarOut(CarBase):
    id: int
    available: bool
    model_config = ConfigDict(from_attributes=True)


# ── Клиенты ─────────────────────────────────────────────────────────

class ClientBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=5, max_length=20)
    email: str = Field("", max_length=100)
    passport_number: str = Field("", max_length=20)


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, min_length=5, max_length=20)
    email: Optional[str] = None
    passport_number: Optional[str] = None


class ClientOut(ClientBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# ── Продажи ──────────────────────────────────────────────────────────

class SaleCreate(BaseModel):
    car_id: int
    client_id: int
    final_price: float = Field(..., gt=0)


class SaleOut(BaseModel):
    id: int
    car_id: int
    client_id: int
    sale_date: datetime
    final_price: float
    car: Optional[CarOut] = None
    client: Optional[ClientOut] = None
    model_config = ConfigDict(from_attributes=True)


# ── Пагинация ────────────────────────────────────────────────────────

class PaginatedCars(BaseModel):
    items: list[CarOut]
    total: int
    page: int
    per_page: int
    pages: int
