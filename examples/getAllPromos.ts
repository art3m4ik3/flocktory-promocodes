import { FlocktoryClient } from "../src/FlocktoryClient";

async function getAllPromos() {
  const client = new FlocktoryClient();

  try {
    console.log("Инициализация сессии");
    await client.initialize();
    console.log("Сессия инициализирована\n");

    console.log("Получение доступных предложений");
    const offers = await client.getOffersWithPromoCodes();
    console.log(`Найдено ${offers.length} предложений с промокодами\n`);

    const maxPromos = Math.min(5, offers.length);
    console.log(`Получение ${maxPromos} промокодов\n`);

    for (let i = 0; i < maxPromos; i++) {
      const offer = offers[i];
      if (!offer) continue;

      try {
        console.log(`[${i + 1}/${maxPromos}] ${offer.service}`);
        const promo = await client.getPromoCode(offer);

        console.log(`Код: ${promo.code}`);
        console.log(`  Описание: ${promo.description?.substring(0, 80)}`);
        console.log();
      } catch (error: any) {
        console.log(`Ошибка: ${error.message}\n`);
      }
    }
  } catch (error: any) {
    console.error(`Ошибка: ${error.message}`);
  }
}

getAllPromos();
