const API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? `${location.protocol}//${location.host}`
    : 'https://autograd-f335.vercel.app';

/* ── Изображения автомобилей ─────────────────────────────────── */
function getCarPlaceholder(brand = 'Авто') {
    const label = String(brand).slice(0, 24);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#1a1a2e"/>
        <rect x="80" y="160" width="640" height="200" rx="24" fill="#252547"/>
        <circle cx="220" cy="360" r="48" fill="#4f6ef7" opacity="0.35"/>
        <circle cx="580" cy="360" r="48" fill="#4f6ef7" opacity="0.35"/>
        <text x="400" y="270" fill="#4f6ef7" font-family="Inter,sans-serif" font-size="36" font-weight="700" text-anchor="middle">${label}</text>
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function shouldProxyImage(url) {
    try {
        const { hostname } = new URL(url);
        return ['images.unsplash.com', 'plus.unsplash.com', 'placehold.co'].includes(hostname);
    } catch {
        return false;
    }
}

function getProxiedImageUrl(url) {
    if (!shouldProxyImage(url)) return null;
    return `${API_BASE}/image-proxy?url=${encodeURIComponent(url)}`;
}

function setCarImage(img, imageUrl, brand) {
    const placeholder = getCarPlaceholder(brand);
    const url = imageUrl?.trim();
    const proxyUrl = url ? getProxiedImageUrl(url) : null;

    img.referrerPolicy = 'no-referrer';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = () => {
        if (proxyUrl && img.dataset.triedProxy !== '1' && img.src !== proxyUrl) {
            img.dataset.triedProxy = '1';
            img.src = proxyUrl;
            return;
        }
        if (img.dataset.fallbackApplied !== '1') {
            img.dataset.fallbackApplied = '1';
            img.src = placeholder;
        }
    };
    img.src = url || placeholder;
}

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
