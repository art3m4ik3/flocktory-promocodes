import { FlocktoryClient } from "../src/FlocktoryClient";

async function listAvailableOffers(): Promise<void> {
  try {
    const client = new FlocktoryClient();

    console.log("Инициализация сессии");
    await client.initialize();
    console.log("Сессия инициализирована\n");

    console.log("Получение доступных предложений");
    const offers = await client.getAvailableOffers();
    console.log(`Найдено ${offers.length} предложений\n`);

    for (const offer of offers) {
      console.log(`ID предложения: ${offer.id}`);
      console.log(`Сервис: ${offer.service}`);
      console.log(`Название: ${offer.title}`);
      console.log(`Описание: ${offer.description}`);

      if (offer.value) {
        console.log(`Значение: ${offer.value}`);
      }

      console.log("---");
    }
  } catch (error) {
    console.error(
      "Ошибка:",
      error instanceof Error ? error.message : String(error),
    );
  }
}

listAvailableOffers();
