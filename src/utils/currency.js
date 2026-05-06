/**
 * Formats a number as Ariary (MGA)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const value = parseFloat(amount || 0);
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value).replace('MGA', 'Ar').trim();
};

export const formatPrice = (amount) => {
  return formatCurrency(amount);
};
