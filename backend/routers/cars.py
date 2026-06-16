from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
from schemas import CarCreate, CarUpdate, CarOut, PaginatedCars
import crud

router = APIRouter(prefix="/cars", tags=["Автомобили"])


@router.get("", response_model=PaginatedCars)
def list_cars(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    brand: str | None = None,
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
    year: int | None = None,
    search: str | None = None,
    sort: str = Query("price_asc"),
    available_only: bool = True,
    db: Session = Depends(get_db),
):
    """Получить список автомобилей с фильтрацией и пагинацией."""
    return crud.get_cars(
        db,
        page=page,
        per_page=per_page,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        year=year,
        search=search,
        sort=sort,
        available_only=available_only,
    )


@router.get("/brands", response_model=list[str])
def list_brands(db: Session = Depends(get_db)):
    """Список уникальных марок для фильтра."""
    return crud.get_brands(db)


@router.get("/{car_id}", response_model=CarOut)
def get_car(car_id: int, db: Session = Depends(get_db)):
    """Получить автомобиль по ID."""
    car = crud.get_car(db, car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return car


@router.post("", response_model=CarOut, status_code=201)
def create_car(data: CarCreate, db: Session = Depends(get_db)):
    """Добавить новый автомобиль."""
    return crud.create_car(db, data)


@router.put("/{car_id}", response_model=CarOut)
def update_car(car_id: int, data: CarUpdate, db: Session = Depends(get_db)):
    """Обновить автомобиль."""
    car = crud.update_car(db, car_id, data)
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return car


@router.delete("/{car_id}")
def delete_car(car_id: int, db: Session = Depends(get_db)):
    """Удалить автомобиль."""
    if not crud.delete_car(db, car_id):
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    return {"detail": "Автомобиль удалён"}
