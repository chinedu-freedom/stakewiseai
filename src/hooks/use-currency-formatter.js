import { useMemo } from 'react';

const formatterCache = new Map();

function getFormatter(locale, options) {
  const key = `${locale}-${JSON.stringify(options)}`;
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options));
  }
  return formatterCache.get(key);
}

export function useCurrencyFormat(defaultCurrency = 'USD') {
  const formatCurrency = useMemo(() => {
    return (amount, currency = defaultCurrency, options = {}) => {
      try {
        const formatter = getFormatter("en-US", {
          style: 'currency',
          currency,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
          ...options,
        });
        return formatter.format(amount);
      } catch (error) {
        console.error('Currency formatting error:', error);
        return `${currency} ${amount.toFixed(2)}`;
      }
    };
  }, [defaultCurrency]);

  return formatCurrency;
}
