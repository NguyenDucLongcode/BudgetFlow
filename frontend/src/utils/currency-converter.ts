export type DisplayCurrency = "VND" | "USD" | "EUR" | "JPY" | "GBP";

export interface CurrencyConfig {
  code: DisplayCurrency;
  label: string;
  symbol: string;
  rateFromVnd: number; // e.g. 1 USD = 25,400 VND
  decimals: number;
}

export const CURRENCY_CONFIGS: Record<DisplayCurrency, CurrencyConfig> = {
  VND: { code: "VND", label: "VND (₫)", symbol: "₫", rateFromVnd: 1, decimals: 0 },
  USD: { code: "USD", label: "USD ($)", symbol: "$", rateFromVnd: 25400, decimals: 2 },
  EUR: { code: "EUR", label: "EUR (€)", symbol: "€", rateFromVnd: 27000, decimals: 2 },
  JPY: { code: "JPY", label: "JPY (¥)", symbol: "¥", rateFromVnd: 165, decimals: 0 },
  GBP: { code: "GBP", label: "GBP (£)", symbol: "£", rateFromVnd: 32000, decimals: 2 },
};

export function convertFromVnd(
  amountVnd: number,
  targetCurrency: DisplayCurrency = "VND"
): { amount: number; formatted: string; symbol: string; code: DisplayCurrency } {
  const config = CURRENCY_CONFIGS[targetCurrency] ?? CURRENCY_CONFIGS.VND;
  const converted = targetCurrency === "VND" ? amountVnd : amountVnd / config.rateFromVnd;

  const formattedNumber = converted.toLocaleString("en-US", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });

  return {
    amount: converted,
    formatted: `${formattedNumber} ${config.symbol}`,
    symbol: config.symbol,
    code: config.code,
  };
}
