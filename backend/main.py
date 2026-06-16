from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
from models import Car, Client, Sale
from routers import cars, clients, sales

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="АвтоГрад API",
    description="REST API автосалона АвтоГрад — дипломный проект",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cars.router)
app.include_router(clients.router)
app.include_router(sales.router)

frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.isdir(frontend_path):
    app.mount("/static", StaticFiles(directory=frontend_path), name="static")


@app.get("/", tags=["Главная"])
def root():
    return {"message": "АвтоГрад API работает", "docs": "/docs"}


@app.on_event("startup")
def seed_demo_data():
    """Заполнение БД демонстрационными данными при первом запуске."""
    from database import SessionLocal
    db = SessionLocal()
    try:
        if db.query(Car).count() > 0:
            return

        demo_cars = [
            Car(
                brand="Toyota", model="Camry", year=2024, price=3_200_000,
                mileage=0, fuel_type="Бензин", transmission="Автомат",
                body_type="Седан", color="Белый", engine_volume=2.5,
                description="Новый Toyota Camry 2024 — комфорт и надёжность. Полный пакет безопасности Toyota Safety Sense.",
                image_url="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
            ),
            Car(
                brand="BMW", model="X5", year=2023, price=7_500_000,
                mileage=12000, fuel_type="Дизель", transmission="Автомат",
                body_type="Внедорожник", color="Чёрный", engine_volume=3.0,
                description="BMW X5 — премиальный внедорожник с мощным дизельным двигателем и адаптивной пневмоподвеской.",
                image_url="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
            ),
            Car(
                brand="Mercedes-Benz", model="E-Class", year=2024, price=6_800_000,
                mileage=0, fuel_type="Бензин", transmission="Автомат",
                body_type="Седан", color="Серебристый", engine_volume=2.0,
                description="Mercedes-Benz E-Class — элегантность и технологии. Система MBUX нового поколения.",
                image_url="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800",
            ),
            Car(
                brand="Audi", model="A6", year=2023, price=5_400_000,
                mileage=8000, fuel_type="Бензин", transmission="Автомат",
                body_type="Седан", color="Синий", engine_volume=2.0,
                description="Audi A6 — сочетание спортивного характера и бизнес-класса. Quattro полный привод.",
                image_url="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800",
            ),
            Car(
                brand="Kia", model="K5", year=2024, price=2_600_000,
                mileage=0, fuel_type="Бензин", transmission="Автомат",
                body_type="Седан", color="Красный", engine_volume=2.5,
                description="Kia K5 — стильный дизайн и передовые технологии по доступной цене.",
                image_url="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800",
            ),
            Car(
                brand="Hyundai", model="Tucson", year=2024, price=3_100_000,
                mileage=0, fuel_type="Бензин", transmission="Автомат",
                body_type="Кроссовер", color="Серый", engine_volume=2.5,
                description="Hyundai Tucson — футуристичный дизайн и просторный салон. Гибридная система.",
                image_url="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
            ),
            Car(
                brand="Lexus", model="RX 350", year=2023, price=6_200_000,
                mileage=5000, fuel_type="Бензин", transmission="Автомат",
                body_type="Кроссовер", color="Белый перламутр", engine_volume=3.5,
                description="Lexus RX 350 — роскошный кроссовер с безупречным качеством сборки.",
                image_url="https://images.unsplash.com/photo-1542362567-b07e54358753?w=800",
            ),
            Car(
                brand="Volkswagen", model="Tiguan", year=2024, price=3_500_000,
                mileage=0, fuel_type="Бензин", transmission="Автомат",
                body_type="Кроссовер", color="Белый", engine_volume=2.0,
                description="Volkswagen Tiguan — немецкое качество и практичность. Система 4Motion.",
                image_url="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
            ),
            Car(
                brand="Mazda", model="CX-5", year=2024, price=2_900_000,
                mileage=0, fuel_type="Бензин", transmission="Автомат",
                body_type="Кроссовер", color="Красный", engine_volume=2.5,
                description="Mazda CX-5 — драйверский кроссовер с технологией SkyActiv и дизайном KODO.",
                image_url="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
            ),
            Car(
                brand="Porsche", model="Cayenne", year=2023, price=9_800_000,
                mileage=3000, fuel_type="Бензин", transmission="Автомат",
                body_type="Внедорожник", color="Чёрный", engine_volume=3.0,
                description="Porsche Cayenne — спортивный внедорожник с характером суперкара.",
                image_url="https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
            ),
            Car(
                brand="Genesis", model="G80", year=2024, price=5_500_000,
                mileage=0, fuel_type="Бензин", transmission="Автомат",
                body_type="Седан", color="Тёмно-зелёный", engine_volume=2.5,
                description="Genesis G80 — корейский люкс с атлетичным дизайном и богатым оснащением.",
                image_url="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
            ),
            Car(
                brand="Land Rover", model="Range Rover Sport", year=2023, price=11_200_000,
                mileage=7000, fuel_type="Дизель", transmission="Автомат",
                body_type="Внедорожник", color="Бронзовый", engine_volume=3.0,
                description="Range Rover Sport — воплощение роскоши и внедорожных возможностей.",
                image_url="https://images.unsplash.com/photo-1519245659620-e859806a8d7b?w=800",
            ),
        ]

        db.add_all(demo_cars)
        db.commit()
    finally:
        db.close()
