import {
  createProvider,
  DEFAULT_PROVIDER,
  isProviderName,
  PROVIDER_NAMES,
} from "../src/providers";

const USAGE = `Использование: bun examples/getPromoByService.ts <название> [количество] [провайдер]
Провайдеры: ${PROVIDER_NAMES.join(", ")} (по умолчанию ${DEFAULT_PROVIDER})\n`;

async function main() {
  const serviceName = process.argv[2];
  const count = parseInt(process.argv[3] || "1", 10);
  const providerName = process.argv[4] || DEFAULT_PROVIDER;

  if (!isProviderName(providerName)) {
    console.log(`Неизвестный провайдер "${providerName}"\n`);
    console.log(USAGE);
    return;
  }

  const provider = createProvider(providerName);

  try {
    console.log(`Инициализация провайдера ${provider.name}`);
    await provider.initialize();
    console.log("Провайдер инициализирован\n");

    if (!serviceName) {
      console.log(USAGE);

      const offers = await provider.getOffersWithPromoCodes();
      const services = [...new Set(offers.map((offer) => offer.service))].sort();

      console.log(`Сервисы с промокодами (${services.length}):`);
      services.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service}`);
      });
      return;
    }

    console.log(`Поиск предложений для сервиса: ${serviceName}`);
    const offers = await provider.getOffersByService(serviceName);

    if (offers.length === 0) {
      console.log(`\nПредложений для сервиса "${serviceName}" не найдено.`);
      console.log(
        "\nПопробуйте запустить без параметров, чтобы увидеть список доступных сервисов.",
      );
      return;
    }

    console.log(`Найдено предложений: ${offers.length}\n`);

    const promos = await provider.getPromoCodesByService(serviceName, count);

    console.log("Результат\n");
    promos.forEach((promo, index) => {
      console.log(`[${index + 1}] Сервис: ${promo.service}`);
      console.log(`    Промокод: ${promo.code}`);
      console.log(`    URL: ${promo.serviceUrl}`);
      if (promo.expiresAt) {
        console.log(`    Действует до: ${new Date(promo.expiresAt).toLocaleString("ru-RU")}`);
      }
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
