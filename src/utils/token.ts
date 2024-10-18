export const formatTokenAmount = (
  amount?: number | string,
  decimals?: number
) => {
  if (!amount || !decimals) return "0";
  const amountNumber = typeof amount === "string" ? parseFloat(amount) : amount;
  return (amountNumber / 10 ** decimals).toFixed(2);
};

export const getAtomicUnits = (amount: number, decimals: number) => {
  return amount * 10 ** decimals;
};
