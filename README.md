# Flocktory Promocodes

Получение бесплатных промокодов от Flocktory.

## Установка

```bash
bun i
```

## Примеры использования

### 1. Получение промокодов по названию сервиса

```bash
bun examples/getPromoByService.ts kinopoisk.ru 2
```

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

## Важное замечание

> [!IMPORTANT]
> Используя этот репозиторий или любой связанный с ним код, вы соглашаетесь с [юридическим уведомлением](LEGAL_NOTICE.md). Автор **не несет ответственности за использование этого репозитория и не одобряет его**, а также не несет ответственности за любые копии, форки, повторные загрузки, сделанные другими пользователями, или за что-либо еще, связанное с этим репозиторием.
