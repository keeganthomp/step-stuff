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

export const calculateAmtOut = (
  amtIn: number,
  price: number,
  decimalsIn = 9,
  decimalsOut = 9
) => {
  return (amtIn * price * 10 ** decimalsOut) / 10 ** decimalsIn;
};

export const calculateAmtIn = (
  amtOut: number,
  price: number,
  decimalsIn = 9,
  decimalsOut = 9
) => {
  return (amtOut * 10 ** decimalsIn) / (price * 10 ** decimalsOut);
};