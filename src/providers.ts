import type { PromoProvider } from "./types";
import { FlocktoryClient } from "./FlocktoryClient";
import { LovipodarkiClient } from "./LovipodarkiClient";

const PROVIDER_FACTORIES = {
  lovipodarki: () => new LovipodarkiClient(),
  flocktory: () => new FlocktoryClient(),
} satisfies Record<string, () => PromoProvider>;

export type ProviderName = keyof typeof PROVIDER_FACTORIES;

export const PROVIDER_NAMES = Object.keys(PROVIDER_FACTORIES) as ProviderName[];

export const DEFAULT_PROVIDER: ProviderName = "lovipodarki";

export function isProviderName(value: string): value is ProviderName {
  return value in PROVIDER_FACTORIES;
}

export function createProvider(name: ProviderName = DEFAULT_PROVIDER): PromoProvider {
  return PROVIDER_FACTORIES[name]();
}
