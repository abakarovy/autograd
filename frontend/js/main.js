const API_BASE = 'http://127.0.0.1:8000';

/* ── Мобильная навигация ────────────────────────────────────── */
function toggleNav() {
    document.querySelector('.nav-links').classList.toggle('active');
}

/* ── Toast-уведомления ──────────────────────────────────────── */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}

/* ── Форматирование цены ────────────────────────────────────── */
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        maximumFractionDigits: 0,
    }).format(price);
}

/* ── API-обёртка ────────────────────────────────────────────── */
async function api(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    try {
        const res = await fetch(url, config);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.detail || `Ошибка ${res.status}`);
        }
        if (res.status === 204) return null;
        return await res.json();
    } catch (e) {
        if (e.message === 'Failed to fetch') {
            showToast('Сервер недоступен. Запустите backend.', 'error');
        }
        throw e;
    }
}

/* ── Навбар: подсветка активной страницы ─────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === page);
    });
});
