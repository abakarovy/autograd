-- ═══════════════════════════════════════════════════════════════
-- SQL-скрипт создания базы данных автосалона «АвтоГрад»
-- СУБД: SQLite
-- Нормализация: 3NF
-- ═══════════════════════════════════════════════════════════════

-- Включение поддержки внешних ключей
PRAGMA foreign_keys = ON;

-- ── Таблица: Автомобили ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cars (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    brand           VARCHAR(100) NOT NULL,
    model           VARCHAR(100) NOT NULL,
    year            INTEGER      NOT NULL CHECK (year >= 1900 AND year <= 2030),
    price           REAL         NOT NULL CHECK (price > 0),
    mileage         INTEGER      DEFAULT 0  CHECK (mileage >= 0),
    fuel_type       VARCHAR(50)  DEFAULT 'Бензин',
    transmission    VARCHAR(50)  DEFAULT 'Автомат',
    body_type       VARCHAR(50)  DEFAULT 'Седан',
    color           VARCHAR(50)  DEFAULT 'Белый',
    engine_volume   REAL         DEFAULT 2.0 CHECK (engine_volume > 0),
    description     TEXT         DEFAULT '',
    image_url       VARCHAR(500) DEFAULT '',
    available       BOOLEAN      DEFAULT 1
);

-- Индексы для таблицы cars
CREATE INDEX IF NOT EXISTS ix_cars_brand     ON cars (brand);
CREATE INDEX IF NOT EXISTS ix_cars_year      ON cars (year);
CREATE INDEX IF NOT EXISTS ix_cars_price     ON cars (price);
CREATE INDEX IF NOT EXISTS ix_cars_available ON cars (available);

-- ── Таблица: Клиенты ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
    id              INTEGER      PRIMARY KEY AUTOINCREMENT,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20)  NOT NULL,
    email           VARCHAR(100) DEFAULT '',
    passport_number VARCHAR(20)  DEFAULT ''
);

-- Индексы для таблицы clients
CREATE INDEX IF NOT EXISTS ix_clients_phone ON clients (phone);
CREATE INDEX IF NOT EXISTS ix_clients_name  ON clients (last_name, first_name);

-- ── Таблица: Продажи ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sales (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    car_id      INTEGER NOT NULL,
    client_id   INTEGER NOT NULL,
    sale_date   DATETIME DEFAULT (datetime('now')),
    final_price REAL     NOT NULL CHECK (final_price > 0),

    FOREIGN KEY (car_id)    REFERENCES cars(id)    ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Индекс для таблицы sales
CREATE INDEX IF NOT EXISTS ix_sales_date ON sales (sale_date);


-- ═══════════════════════════════════════════════════════════════
-- ER-диаграмма (текстовое описание связей)
-- ═══════════════════════════════════════════════════════════════
--
--  ┌──────────┐        ┌──────────┐        ┌──────────┐
--  │   cars   │        │  sales   │        │ clients  │
--  ├──────────┤        ├──────────┤        ├──────────┤
--  │ id (PK)  │───┐    │ id (PK)  │    ┌───│ id (PK)  │
--  │ brand    │   │    │ car_id   │────┘   │ first_n  │
--  │ model    │   └────│ client_id│        │ last_n   │
--  │ year     │        │ sale_date│        │ phone    │
--  │ price    │        │ final_p  │        │ email    │
--  │ mileage  │        └──────────┘        │ passport │
--  │ fuel     │                            └──────────┘
--  │ transm.  │
--  │ body     │
--  │ color    │
--  │ engine_v │
--  │ descript │
--  │ image_url│
--  │ available│
--  └──────────┘
--
--  Связи:
--  • cars (1) ──── (N) sales    → Один автомобиль может быть продан один раз
--  • clients (1) ── (N) sales   → Один клиент может совершить несколько покупок
--  • sales.car_id    → FK на cars.id    (ON DELETE CASCADE)
--  • sales.client_id → FK на clients.id (ON DELETE CASCADE)
--
-- ═══════════════════════════════════════════════════════════════
