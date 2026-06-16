from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import SaleCreate, SaleOut
import crud

router = APIRouter(prefix="/sales", tags=["Продажи"])


@router.get("", response_model=list[SaleOut])
def list_sales(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Получить список продаж."""
    return crud.get_sales(db, skip=skip, limit=limit)


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    """Получить продажу по ID."""
    sale = crud.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Продажа не найдена")
    return sale


@router.post("", response_model=SaleOut, status_code=201)
def create_sale(data: SaleCreate, db: Session = Depends(get_db)):
    """
    Оформить продажу автомобиля.
    При создании автомобиль автоматически помечается как проданный.
    """
    car = crud.get_car(db, data.car_id)
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")
    if not car.available:
        raise HTTPException(status_code=400, detail="Автомобиль уже продан")

    client = crud.get_client(db, data.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")

    return crud.create_sale(db, data)
