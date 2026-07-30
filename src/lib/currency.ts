export const formatMYR = (amount: number): string => {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('MYR', 'RM');
};

export const formatSoldQuantity = (sold?: number): string => {
  const count = sold ?? 0;
  if (count === 0) {
    return '0 Terjual';
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k+ Terjual`;
  }
  return `${count} Terjual`;
};
