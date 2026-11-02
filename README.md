# Flocktory Promocodes

Получение бесплатных промокодов от Flocktory и lovipodarki.ru (витрина Perfluence).

## Установка

```bash
bun i
```

## Примеры использования

### 1. Получение промокодов по названию сервиса

```bash
bun examples/getPromoByService.ts "яндекс музыка" 3
bun examples/getPromoByService.ts kinopoisk 1 flocktory
```

Аргументы: `<название> [количество] [провайдер]`. Провайдеры: `lovipodarki` (по умолчанию), `flocktory`. Без аргументов выводится список сервисов с промокодами.

### 2. Список всех доступных предложений

```bash
bun examples/listOffers.ts
```

### 3. Получение одного промокода

```bash
bun examples/getSinglePromo.ts
```

### 4. Получение нескольких промокодов

```bash
bun examples/getAllPromos.ts
```

## API

```typescript
import { FlocktoryClient } from "./src/FlocktoryClient";

const client = new FlocktoryClient();

// Инициализация
await client.initialize();

// Получить все предложения
const offers = await client.getAvailableOffers();

// Получить предложения по сервису
const offers = await client.getOffersByService("yandex");

// Получить предложение по ID
const offer = await client.getOfferById(925351);

// Получить промокод для предложения
const promo = await client.getPromoCode(offer);

// Получить несколько промокодов
const promos = await client.getMultiplePromoCodes([offer1, offer2]);

// Получить промокоды по названию сервиса
const promos = await client.getPromoCodesByService("yandex", 3);
```

## Как работает

1. **Загрузка лендинга**: `GET https://share.flocktory.com/exchange/login` -> из инлайн-скрипта `const CONFIG = {"campaigns": [...]}` берётся массив кампаний
2. **Офферы**: у каждой кампании есть `id`, `title`, `conditions`, `fields` (поля формы) и, для промо-офферов, `redirectUrl`. Сервис определяется по домену `redirectUrl`
3. **Промокод**: извлекается из query-параметров `redirectUrl` (`promocode`, `promo_code`, `code` и т.п.)

> [!NOTE]
> Промокоды на новом лендинге статичные: одинаковые для всех посетителей и при каждой загрузке. Кампании с полями `phone`/`name` — лид-формы без промокода, `getPromoCode` для них бросает ошибку. Используйте `getOffersWithPromoCodes()`, чтобы получить только офферы с кодами.

## lovipodarki.ru

```typescript
import { LovipodarkiClient } from "./src/LovipodarkiClient";

const client = new LovipodarkiClient();
await client.initialize();
const promos = await client.getPromoCodesByService("yandex", 3);
```

1. **Каталог**: `GET https://lovipodarki.ru/api/offers?s={partnerId}&limit=100&offset={n}` -> `data.items`
2. **Тип оффера** (`type`):
   - `personal` — `POST /api/offers/personal-code` с `{ offer_id, uuid }`. `uuid` — случайный идентификатор устройства, на каждый новый `uuid` выдаётся уникальный код
   - `promo_code` — `GET /api/offers/{id}/code`, код общий для всех
   - `link` — ссылка без промокода
3. Офферы с истёкшим `expires_at` пропускаются

Если кодов запрошено больше, чем подходящих офферов, недостающие добираются повторными запросами к `personal`-офферам.

## Важное замечание

> [!IMPORTANT]
> Используя этот репозиторий или любой связанный с ним код, вы соглашаетесь с [юридическим уведомлением](LEGAL_NOTICE.md). Автор **не несет ответственности за использование этого репозитория и не одобряет его**, а также не несет ответственности за любые копии, форки, повторные загрузки, сделанные другими пользователями, или за что-либо еще, связанное с этим репозиторием.
