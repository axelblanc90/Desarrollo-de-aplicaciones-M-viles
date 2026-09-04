export const formatCurrency = (amount: number, symbol: string = '$'): string => {
  const isWhole = Number.isInteger(amount);
  const formattedNumber = isWhole
    ? amount.toString()
    : amount.toFixed(2).replace('.', ',');
  return `${symbol}${formattedNumber}`;
};

export const formatSubtotalHeader = (itemCount: number, total: number): string => {
  const formattedTotal = total.toFixed(2).replace('.', ',');
  return `${itemCount} ${itemCount === 1 ? 'item' : 'items'} - Total ${formattedTotal}€`;
};
