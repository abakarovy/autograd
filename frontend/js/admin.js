/* ═══════════════════════════════════════════════════════════════
   Админ-панель — CRUD управление автомобилями, клиенты, продажи
   ═══════════════════════════════════════════════════════════════ */

/* ── Переключение вкладок ───────────────────────────────────── */
function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(
            name === 'cars' ? 'автомобили' : name === 'clients' ? 'клиенты' : 'продажи'
        ));
    });

    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.getElementById(`tab-${name}`).classList.add('active');

    if (name === 'cars') loadAdminCars();
    else if (name === 'clients') loadClients();
    else if (name === 'sales') loadSales();
}

/* ═══════════════════════════════════════════════════════════════
   Автомобили
   ═══════════════════════════════════════════════════════════════ */

async function loadAdminCars() {
    const tbody = document.getElementById('cars-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px"><div class="loader-spinner" style="margin:0 auto"></div></td></tr>';

    try {
        const data = await api('/cars?per_page=50&available_only=false');
        tbody.innerHTML = '';

        if (!data.items.length) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Нет автомобилей</td></tr>';
            return;
        }

        data.items.forEach(car => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${car.id}</td>
                <td>${car.brand}</td>
                <td>${car.model}</td>
                <td>${car.year}</td>
                <td>${formatPrice(car.price)}</td>
                <td class="${car.available ? 'status-available' : 'status-sold'}">
                    ${car.available ? 'В наличии' : 'Продан'}
                </td>
                <td>
                    <div class="admin-actions">
                        <button class="btn-edit" onclick="editCar(${car.id})">Изменить</button>
                        <button class="btn-delete" onclick="deleteCar(${car.id}, '${car.brand} ${car.model}')">Удалить</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#ef4444">Ошибка загрузки</td></tr>';
    }
}

/* ── Форма добавления / редактирования ──────────────────────── */
function openCarForm(car = null) {
    const modal = document.getElementById('modal-car');
    const title = document.getElementById('car-form-title');

    if (car) {
        title.textContent = 'Редактировать автомобиль';
        document.getElementById('car-form-id').value = car.id;
        document.getElementById('cf-brand').value = car.brand;
        document.getElementById('cf-model').value = car.model;
        document.getElementById('cf-year').value = car.year;
        document.getElementById('cf-price').value = car.price;
        document.getElementById('cf-mileage').value = car.mileage || 0;
        document.getElementById('cf-engine').value = car.engine_volume || 2.0;
        document.getElementById('cf-fuel').value = car.fuel_type || 'Бензин';
        document.getElementById('cf-transmission').value = car.transmission || 'Автомат';
        document.getElementById('cf-body').value = car.body_type || 'Седан';
        document.getElementById('cf-color').value = car.color || 'Белый';
        document.getElementById('cf-image').value = car.image_url || '';
        document.getElementById('cf-description').value = car.description || '';
    } else {
        title.textContent = 'Добавить автомобиль';
        document.getElementById('car-form').reset();
        document.getElementById('car-form-id').value = '';
        document.getElementById('cf-mileage').value = 0;
        document.getElementById('cf-engine').value = 2.0;
    }

    modal.classList.add('active');
}

function closeCarForm() {
    document.getElementById('modal-car').classList.remove('active');
}

async function editCar(id) {
    try {
        const car = await api(`/cars/${id}`);
        openCarForm(car);
    } catch {
        showToast('Не удалось загрузить данные', 'error');
    }
}

async function handleCarForm(e) {
    e.preventDefault();

    const id = document.getElementById('car-form-id').value;
    const payload = {
        brand: document.getElementById('cf-brand').value.trim(),
        model: document.getElementById('cf-model').value.trim(),
        year: parseInt(document.getElementById('cf-year').value),
        price: parseFloat(document.getElementById('cf-price').value),
        mileage: parseInt(document.getElementById('cf-mileage').value) || 0,
        engine_volume: parseFloat(document.getElementById('cf-engine').value) || 2.0,
        fuel_type: document.getElementById('cf-fuel').value,
        transmission: document.getElementById('cf-transmission').value,
        body_type: document.getElementById('cf-body').value,
        color: document.getElementById('cf-color').value.trim(),
        image_url: document.getElementById('cf-image').value.trim(),
        description: document.getElementById('cf-description').value.trim(),
    };

    if (!payload.brand || !payload.model || !payload.year || !payload.price) {
        showToast('Заполните обязательные поля', 'error');
        return;
    }

    try {
        if (id) {
            await api(`/cars/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
            showToast('Автомобиль обновлён', 'success');
        } else {
            await api('/cars', { method: 'POST', body: JSON.stringify(payload) });
            showToast('Автомобиль добавлен', 'success');
        }

        closeCarForm();
        loadAdminCars();
    } catch (e) {
        showToast(e.message || 'Ошибка сохранения', 'error');
    }
}

async function deleteCar(id, name) {
    if (!confirm(`Удалить ${name}?`)) return;

    try {
        await api(`/cars/${id}`, { method: 'DELETE' });
        showToast('Автомобиль удалён', 'success');
        loadAdminCars();
    } catch (e) {
        showToast(e.message || 'Ошибка удаления', 'error');
    }
}

/* ═══════════════════════════════════════════════════════════════
   Клиенты
   ═══════════════════════════════════════════════════════════════ */

async function loadClients() {
    const tbody = document.getElementById('clients-tbody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px"><div class="loader-spinner" style="margin:0 auto"></div></td></tr>';

    try {
        const clients = await api('/clients');
        tbody.innerHTML = '';

        if (!clients.length) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Нет клиентов</td></tr>';
            return;
        }

        clients.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${c.id}</td>
                <td>${c.first_name}</td>
                <td>${c.last_name}</td>
                <td>${c.phone}</td>
                <td>${c.email || '—'}</td>
                <td>${c.passport_number || '—'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#ef4444">Ошибка загрузки</td></tr>';
    }
}

/* ═══════════════════════════════════════════════════════════════
   Продажи
   ═══════════════════════════════════════════════════════════════ */

async function loadSales() {
    const tbody = document.getElementById('sales-tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px"><div class="loader-spinner" style="margin:0 auto"></div></td></tr>';

    try {
        const sales = await api('/sales');
        tbody.innerHTML = '';

        if (!sales.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Нет продаж</td></tr>';
            return;
        }

        sales.forEach(s => {
            const date = new Date(s.sale_date).toLocaleDateString('ru-RU', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            });

            const carName = s.car ? `${s.car.brand} ${s.car.model}` : `Авто #${s.car_id}`;
            const clientName = s.client ? `${s.client.first_name} ${s.client.last_name}` : `Клиент #${s.client_id}`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${s.id}</td>
                <td>${carName}</td>
                <td>${clientName}</td>
                <td>${date}</td>
                <td>${formatPrice(s.final_price)}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:#ef4444">Ошибка загрузки</td></tr>';
    }
}

/* ── Инициализация ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    loadAdminCars();

    document.getElementById('car-form').addEventListener('submit', handleCarForm);

    document.getElementById('modal-car').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeCarForm();
    });
});
