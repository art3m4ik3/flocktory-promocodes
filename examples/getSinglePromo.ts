import { FlocktoryClient } from "../src/FlocktoryClient";

async function getSinglePromoCode(): Promise<void> {
  try {
    const client = new FlocktoryClient();

    console.log("Инициализация сессии");
    await client.initialize();
    console.log("Сессия инициализирована\n");

    console.log("Получение доступных предложений");
    const offers = await client.getAvailableOffers();
    console.log(`Найдено ${offers.length} предложений\n`);

    if (offers.length === 0) {
      console.log("Нет доступных предложений");
      return;
    }

    const firstOffer = offers[0];
    if (!firstOffer) {
      console.log("Нет первого предложения");
      return;
    }

    console.log(
      `Выбрано предложение: ${firstOffer.service} - ${firstOffer.title}`,
    );
    console.log("Получение промокода\n");
    const promoCode = await client.getPromoCode(firstOffer);

    console.log("Промокод получен\n");
    console.log("Детали промокода");
    console.log(`Сервис: ${promoCode.service}`);
    console.log(`Код: ${promoCode.code}`);
    console.log(`URL: ${promoCode.serviceUrl}`);

    if (promoCode.description) {
      console.log(`Описание: ${promoCode.description}`);
    }
  } catch (error) {
    console.error(
      "Ошибка:",
      error instanceof Error ? error.message : String(error),
    );
  }
}

getSinglePromoCode();
