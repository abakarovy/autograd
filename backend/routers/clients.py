from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from schemas import ClientCreate, ClientUpdate, ClientOut
import crud

router = APIRouter(prefix="/clients", tags=["Клиенты"])


@router.get("", response_model=list[ClientOut])
def list_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Получить список клиентов."""
    return crud.get_clients(db, skip=skip, limit=limit)


@router.get("/{client_id}", response_model=ClientOut)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Получить клиента по ID."""
    client = crud.get_client(db, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return client


@router.post("", response_model=ClientOut, status_code=201)
def create_client(data: ClientCreate, db: Session = Depends(get_db)):
    """Добавить нового клиента."""
    return crud.create_client(db, data)


@router.put("/{client_id}", response_model=ClientOut)
def update_client(client_id: int, data: ClientUpdate, db: Session = Depends(get_db)):
    """Обновить данные клиента."""
    client = crud.update_client(db, client_id, data)
    if not client:
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return client


@router.delete("/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    """Удалить клиента."""
    if not crud.delete_client(db, client_id):
        raise HTTPException(status_code=404, detail="Клиент не найден")
    return {"detail": "Клиент удалён"}
