export function formatCurrency(amount: number, countryCode: string = "IN"): string {
  const currencyMap: Record<string, string> = {
    US: "USD",
    UK: "GBP",
    EU: "EUR",
    IN: "INR",
    CA: "CAD",
    AU: "AUD",
    JP: "JPY",
  };

  const currency = currencyMap[countryCode] || "USD";
  
  // Use appropriate locale based on country for realistic number grouping
  const localeMap: Record<string, string> = {
    US: "en-US",
    UK: "en-GB",
    EU: "de-DE",
    IN: "en-IN",
    CA: "en-CA",
    AU: "en-AU",
    JP: "ja-JP",
  };

  const locale = localeMap[countryCode] || "en-US";
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
