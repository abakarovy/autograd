/* ═══════════════════════════════════════════════════════════════
   Страница автомобиля — детальная информация + покупка
   ═══════════════════════════════════════════════════════════════ */

let currentCar = null;

/* ── Загрузка информации об автомобиле ──────────────────────── */
async function loadCar() {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) {
        showToast('ID автомобиля не указан', 'error');
        return;
    }

    try {
        const car = await api(`/cars/${id}`);
        currentCar = car;
        renderCar(car);
    } catch (e) {
        showToast('Автомобиль не найден', 'error');
        document.getElementById('car-loader').innerHTML =
            '<div class="empty-state"><div class="empty-state-icon">🚫</div><h3>Автомобиль не найден</h3></div>';
    }
}

/* ── Отрисовка информации ───────────────────────────────────── */
function renderCar(car) {
    document.getElementById('car-loader').style.display = 'none';
    document.getElementById('car-detail').style.display = 'block';

    document.title = `${car.brand} ${car.model} — АвтоГрад`;
    const carImage = document.getElementById('car-image');
    carImage.alt = `${car.brand} ${car.model}`;
    setCarImage(carImage, car.image_url, car.brand);
    document.getElementById('car-title').textContent = `${car.brand} ${car.model}`;
    document.getElementById('car-year').textContent = `${car.year} год`;
    document.getElementById('car-price').textContent = formatPrice(car.price);
    document.getElementById('car-description').textContent = car.description || 'Описание отсутствует.';

    const specs = [
        { label: 'Пробег', value: car.mileage === 0 ? 'Новый' : `${car.mileage.toLocaleString('ru-RU')} км` },
        { label: 'Двигатель', value: `${car.engine_volume} л` },
        { label: 'Топливо', value: car.fuel_type },
        { label: 'КПП', value: car.transmission },
        { label: 'Кузов', value: car.body_type },
        { label: 'Цвет', value: car.color },
    ];

    const specsGrid = document.getElementById('car-specs');
    specsGrid.innerHTML = specs.map(s => `
        <div class="car-spec-item">
            <div class="label">${s.label}</div>
            <div class="value">${s.value}</div>
        </div>
    `).join('');

    const buyBtn = document.getElementById('btn-buy');
    if (!car.available) {
        buyBtn.textContent = 'Автомобиль продан';
        buyBtn.disabled = true;
        buyBtn.style.opacity = '0.5';
    }
}

/* ── Модальное окно ─────────────────────────────────────────── */
function openModal() {
    if (!currentCar || !currentCar.available) return;
    document.getElementById('modal-car-name').textContent =
        `${currentCar.brand} ${currentCar.model} — ${formatPrice(currentCar.price)}`;
    document.getElementById('modal-buy').classList.add('active');
}

function closeModal() {
    document.getElementById('modal-buy').classList.remove('active');
}

/* ── Оформление покупки ─────────────────────────────────────── */
async function handleBuy(e) {
    e.preventDefault();

    const firstName = document.getElementById('buy-first-name').value.trim();
    const lastName = document.getElementById('buy-last-name').value.trim();
    const phone = document.getElementById('buy-phone').value.trim();
    const email = document.getElementById('buy-email').value.trim();
    const passport = document.getElementById('buy-passport').value.trim();

    if (!firstName || !lastName || !phone) {
        showToast('Заполните обязательные поля', 'error');
        return;
    }

    try {
        const client = await api('/clients', {
            method: 'POST',
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                email: email,
                passport_number: passport,
            }),
        });

        await api('/sales', {
            method: 'POST',
            body: JSON.stringify({
                car_id: currentCar.id,
                client_id: client.id,
                final_price: currentCar.price,
            }),
        });

        closeModal();
        showToast('Покупка успешно оформлена!', 'success');

        currentCar.available = false;
        const buyBtn = document.getElementById('btn-buy');
        buyBtn.textContent = 'Автомобиль продан';
        buyBtn.disabled = true;
        buyBtn.style.opacity = '0.5';

    } catch (e) {
        showToast(e.message || 'Ошибка оформления', 'error');
    }
}

/* ── Инициализация ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    loadCar();

    document.getElementById('btn-buy').addEventListener('click', openModal);
    document.getElementById('buy-form').addEventListener('submit', handleBuy);

    document.getElementById('modal-buy').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
});
