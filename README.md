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
const offers = await client.getOffersByService("vtb.ru");

// Получить предложение по ID
const offer = await client.getOfferById(925351);

// Получить промокод для предложения
const promo = await client.getPromoCode(offer);

// Получить несколько промокодов
const promos = await client.getMultiplePromoCodes([offer1, offer2]);

// Получить промокоды по названию сервиса
const promos = await client.getPromoCodesByService("vtb.ru", 3);
```

## Как работает

1. **Инициализация**: `/exchange/login` -> редирект на `/interchange/{uuid}`. Из `window.flockInitialState` берутся `uuid`, `app.jwtToken` и `siteInfo.data.id` (siteId)
2. **Получение офферов**: `GET /interchange/{uuid}/api/offers/list?jwtToken={jwt}&siteId={siteId}&email={email}` -> массив `campaigns`
3. **Активация**: `POST /interchange/{uuid}/api/offers/accept` с `jwtToken`, `email`, `offerId`, `offerSiteId` (из `campaign.site.id`), `siteId`, согласиями и UTM-метками -> URL с промокодом
4. **Декодирование**: Извлечение JWT из параметра `data` -> `coupon.coupon`

> [!NOTE]
> Email генерируется случайным образом при создании клиента, чтобы избежать спама. Часть офферов — лид-форма без промокода: для них сервер возвращает текст вроде «Не требуется», а не код.

## Важное замечание

> [!IMPORTANT]
> Используя этот репозиторий или любой связанный с ним код, вы соглашаетесь с [юридическим уведомлением](LEGAL_NOTICE.md). Автор **не несет ответственности за использование этого репозитория и не одобряет его**, а также не несет ответственности за любые копии, форки, повторные загрузки, сделанные другими пользователями, или за что-либо еще, связанное с этим репозиторием.
