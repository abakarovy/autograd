"""Загрузка изображений для карточек автомобилей."""

import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from storage import cars_upload_dir

router = APIRouter(prefix="/upload", tags=["Загрузки"])

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_BYTES = 8 * 1024 * 1024  # 8 МБ


@router.post("/car-photo")
async def upload_car_photo(file: UploadFile = File(...)):
    """Сохраняет фото и возвращает относительный URL для поля image_url."""
    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Допустимы только изображения: JPEG, PNG, WebP, GIF",
        )

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="Файл больше 8 МБ")

    ext = ALLOWED_TYPES[content_type]
    name = f"{uuid.uuid4().hex}{ext}"
    dest = cars_upload_dir() / name

    dest.write_bytes(data)

    return {"url": f"/media/cars/{name}", "filename": name}
