/* ═══════════════════════════════════════════════════════════════
   Каталог — динамическая загрузка, фильтрация, пагинация
   ═══════════════════════════════════════════════════════════════ */

let currentPage = 1;
const PER_PAGE = 12;
let debounceTimer;

/* ── Загрузка марок в фильтр ────────────────────────────────── */
async function loadBrands() {
    try {
        const brands = await api('/cars/brands');
        const select = document.getElementById('filter-brand');
        brands.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b;
            opt.textContent = b;
            select.appendChild(opt);
        });
    } catch { /* фильтр просто останется пустым */ }
}

/* ── Загрузка автомобилей ───────────────────────────────────── */
async function loadCars(page = 1) {
    const grid = document.getElementById('cars-grid');
    const loader = document.getElementById('catalog-loader');
    const empty = document.getElementById('empty-state');
    const pag = document.getElementById('pagination');

    loader.style.display = 'flex';
    grid.innerHTML = '';
    empty.style.display = 'none';
    pag.innerHTML = '';

    const params = new URLSearchParams();
    params.set('page', page);
    params.set('per_page', PER_PAGE);

    const search = document.getElementById('filter-search').value.trim();
    const brand = document.getElementById('filter-brand').value;
    const minP = document.getElementById('filter-min-price').value;
    const maxP = document.getElementById('filter-max-price').value;
    const year = document.getElementById('filter-year').value;
    const sort = document.getElementById('filter-sort').value;

    if (search) params.set('search', search);
    if (brand) params.set('brand', brand);
    if (minP) params.set('min_price', minP);
    if (maxP) params.set('max_price', maxP);
    if (year) params.set('year', year);
    if (sort) params.set('sort', sort);

    try {
        const data = await api(`/cars?${params.toString()}`);
        loader.style.display = 'none';

        if (!data.items.length) {
            empty.style.display = 'block';
            return;
        }

        currentPage = data.page;

        data.items.forEach((car, i) => {
            const card = createCarCard(car, i);
            grid.appendChild(card);
        });

        renderPagination(data.page, data.pages, data.total);

    } catch (e) {
        loader.style.display = 'none';
        showToast('Не удалось загрузить каталог', 'error');
    }
}

/* ── Карточка автомобиля ────────────────────────────────────── */
function createCarCard(car, index) {
    const card = document.createElement('div');
    card.className = 'car-card';
    card.style.animationDelay = `${index * 0.08}s`;

    const isNew = car.mileage === 0;

    const wrapper = document.createElement('div');
    wrapper.className = 'car-card-image-wrapper';

    const img = document.createElement('img');
    img.className = 'car-card-image';
    img.alt = `${car.brand} ${car.model}`;
    setCarImage(img, car.image_url, car.brand);
    wrapper.appendChild(img);

    const badge = document.createElement('span');
    badge.className = `car-card-badge ${isNew ? 'new' : 'used'}`;
    badge.textContent = isNew ? 'Новый' : 'С пробегом';
    wrapper.appendChild(badge);

    const body = document.createElement('div');
    body.className = 'car-card-body';
    body.innerHTML = `
        <div class="car-card-title">${car.brand} ${car.model}</div>
        <div class="car-card-year">${car.year} год</div>
        <div class="car-card-specs">
            <span class="car-card-spec">⛽ ${car.fuel_type}</span>
            <span class="car-card-spec">⚙ ${car.transmission}</span>
            <span class="car-card-spec">🚙 ${car.body_type}</span>
        </div>
        <div class="car-card-footer">
            <div class="car-card-price">${formatPrice(car.price)}</div>
            <a href="car.html?id=${car.id}" class="btn btn-primary btn-sm">Подробнее</a>
        </div>
    `;

    card.appendChild(wrapper);
    card.appendChild(body);

    return card;
}

/* ── Пагинация ──────────────────────────────────────────────── */
function renderPagination(page, pages, total) {
    const container = document.getElementById('pagination');
    container.innerHTML = '';

    if (pages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Назад';
    prevBtn.disabled = page <= 1;
    prevBtn.onclick = () => loadCars(page - 1);
    container.appendChild(prevBtn);

    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(pages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === page ? 'active' : '';
        btn.onclick = () => loadCars(i);
        container.appendChild(btn);
    }

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Вперёд →';
    nextBtn.disabled = page >= pages;
    nextBtn.onclick = () => loadCars(page + 1);
    container.appendChild(nextBtn);

    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `Всего: ${total}`;
    container.appendChild(info);
}

/* ── Обработчики фильтров ───────────────────────────────────── */
function onFilterChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => loadCars(1), 350);
}

document.addEventListener('DOMContentLoaded', () => {
    loadBrands();
    loadCars(1);

    ['filter-search', 'filter-min-price', 'filter-max-price', 'filter-year'].forEach(id => {
        document.getElementById(id).addEventListener('input', onFilterChange);
    });

    ['filter-brand', 'filter-sort'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => loadCars(1));
    });
});
