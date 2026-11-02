import { FlocktoryClient } from "../src/FlocktoryClient";

async function main() {
  const serviceName = process.argv[2];
  const count = parseInt(process.argv[3] || "1", 10);
  const client = new FlocktoryClient();

  try {
    console.log("Инициализация сессии");
    await client.initialize();
    console.log("Сессия инициализирована\n");

    if (!serviceName) {
      console.log(
        "Использование: bun examples/getPromoByService.ts <название> [количество]\n",
      );

      const offers = await client.getOffersWithPromoCodes();
      const services = [...new Set(offers.map((offer) => offer.service))].sort();

      console.log(`Сервисы с промокодами (${services.length}):`);
      services.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service}`);
      });
      return;
    }

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

    const promos = await client.getPromoCodesByService(serviceName, count);

    console.log("Результат\n");
    promos.forEach((promo, index) => {
      console.log(`[${index + 1}] Сервис: ${promo.service}`);
      console.log(`    Промокод: ${promo.code}`);
      console.log(`    URL: ${promo.serviceUrl}`);
      if (promo.description) {
        const desc =
          promo.description.length > 100
            ? promo.description.substring(0, 100) + "..."
            : promo.description;
        console.log(`    Описание: ${desc}`);
      }
      console.log();
    });

    console.log(`Получено ${promos.length} из ${count} промокод(ов)`);
  } catch (error: any) {
    console.error(`\nОшибка: ${error.message}`);
  }
}

main();
