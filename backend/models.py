from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text,
    ForeignKey, DateTime, Index,
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from database import Base


class Car(Base):
    """Модель автомобиля в каталоге автосалона."""

    __tablename__ = "cars"

    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    mileage = Column(Integer, default=0)
    fuel_type = Column(String(50), default="Бензин")
    transmission = Column(String(50), default="Автомат")
    body_type = Column(String(50), default="Седан")
    color = Column(String(50), default="Белый")
    engine_volume = Column(Float, default=2.0)
    description = Column(Text, default="")
    image_url = Column(String(500), default="")
    available = Column(Boolean, default=True)

    sales = relationship("Sale", back_populates="car", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_cars_brand", "brand"),
        Index("ix_cars_year", "year"),
        Index("ix_cars_price", "price"),
        Index("ix_cars_available", "available"),
    )


class Client(Base):
    """Модель клиента автосалона."""

    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), default="")
    passport_number = Column(String(20), default="")

    sales = relationship("Sale", back_populates="client", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_clients_phone", "phone"),
        Index("ix_clients_name", "last_name", "first_name"),
    )


class Sale(Base):
    """Модель продажи автомобиля."""

    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    car_id = Column(Integer, ForeignKey("cars.id", ondelete="CASCADE"), nullable=False)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False)
    sale_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    final_price = Column(Float, nullable=False)

    car = relationship("Car", back_populates="sales")
    client = relationship("Client", back_populates="sales")

    __table_args__ = (
        Index("ix_sales_date", "sale_date"),
    )
