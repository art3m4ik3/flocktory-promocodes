import { FlocktoryClient } from "../src/FlocktoryClient";

async function main() {
  const serviceName = process.argv[2];
  const count = parseInt(process.argv[3] || "1", 10);

  if (!serviceName) {
    console.log(
      "Использование: bun examples/getPromoByService.ts <название> [количество]\n",
    );

    console.log("Получение списка доступных сервисов\n");
    const client = new FlocktoryClient();

    try {
      await client.initialize();
      const offers = await client.getAvailableOffers();

      const services = new Set<string>();
      offers.forEach((offer) => services.add(offer.service));

      console.log(`Доступные сервисы (${services.size}):`);
      Array.from(services)
        .sort()
        .forEach((service, index) => {
          console.log(`  ${index + 1}. ${service}`);
        });
    } catch (error: any) {
      console.error(`Ошибка: ${error.message}`);
    }

    return;
  }

  const client = new FlocktoryClient();

  try {
    console.log("Инициализация сессии");
    await client.initialize();
    console.log("Сессия инициализирована\n");

    console.log(`Поиск предложений для сервиса: ${serviceName}`);
    const offers = await client.getOffersByService(serviceName);

    if (offers.length === 0) {
      console.log(`\nПредложений для сервиса "${serviceName}" не найдено.`);
      console.log(
        "\nПопробуйте запустить без параметров, чтобы увидеть список доступных сервисов.",
      );
      return;
    }

    console.log(`Найдено предложений: ${offers.length}\n`);

    console.log(`Получение ${count} промокод(ов)\n`);

    const promos = [];
    const firstOffer = offers[0];

    if (!firstOffer) {
      console.log(
        `\nНе удалось получить предложение для сервиса "${serviceName}".`,
      );
      return;
    }

    for (let i = 0; i < count; i++) {
      try {
        console.log(`[${i + 1}/${count}] Создание новой сессии`);

        const newClient = new FlocktoryClient();
        await newClient.initialize();

        console.log(`[${i + 1}/${count}] Получение промокода`);
        const promo = await newClient.getPromoCode(firstOffer);
        promos.push(promo);
        console.log(`Получен: ${promo.code}`);
      } catch (error: any) {
        console.error(
          `Ошибка при получении промокода ${i + 1}: ${error.message}`,
        );
      }
    }

    console.log("\nРезультат\n");
    promos.forEach((promo, index) => {
      console.log(`[${index + 1}] Сервис: ${promo.service}`);
      console.log(`    Промокод: ${promo.code}`);
      if (promo.description) {
        const desc =
          promo.description.length > 100
            ? promo.description.substring(0, 100) + "..."
            : promo.description;
        console.log(`    Описание: ${desc}`);
      }
      console.log();
    });

    console.log(`Получено ${promos.length} промокод(ов)`);
  } catch (error: any) {
    console.error(`\nОшибка: ${error.message}`);
  }
}

main();
