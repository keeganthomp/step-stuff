import Image from "next/image";
import React, { useState, useEffect } from "react";

interface TokenAmountInputProps {
  image: string;
  onChange: (amount: number) => void;
  value: number | null;
  currentBalance?: number | null | string;
}

const TOKEN_IMAGE_SIZE = 32;
const DEFAULT_MAX_DECIMALS = 2;

const validateAmount = (amount: string): number | null => {
  if (amount === "") return null;
  const regex = new RegExp(
    `^(0|[1-9]\\d*)(\\.\\d{0,${DEFAULT_MAX_DECIMALS}})?$`
  );
  if (!regex.test(amount)) return null;
  const num = parseFloat(amount);
  return isNaN(num) ? null : Number(num);
};

const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  image,
  onChange,
  value,
  currentBalance,
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (value === null || value === 0) {
      setInputValue("");
    } else {
      // Preserve the original number of decimal places, up to DEFAULT_MAX_DECIMALS
      const [integer, fraction] = value.toString().split(".");
      const decimals = fraction ? fraction.slice(0, DEFAULT_MAX_DECIMALS) : "";
      setInputValue(decimals ? `${integer}.${decimals}` : integer);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow the user to type a single "0" or "0."
    if (newValue === "0" || newValue === "0.") {
      setInputValue(newValue);
      onChange(0);
      return;
    }

    // Prevent more than one decimal point
    if (newValue.split(".").length > 2) return;

    // Validate and update if it passes
    const validatedAmount = validateAmount(newValue);
    if (validatedAmount !== null || newValue === "") {
      setInputValue(newValue);
      onChange(validatedAmount !== null ? validatedAmount : 0);
    }
  };

  const isBeyondMax = Number(inputValue || 0) > Number(currentBalance || 0);

  return (
    <>
      <div className="flex items-center gap-2 bg-gray-100 p-4 relative rounded-lg">
        <Image
          src={image}
          alt="token-logo"
          width={TOKEN_IMAGE_SIZE}
          height={TOKEN_IMAGE_SIZE}
        />
        <input
          type="text"
          className="border-0 rounded px-2 py-1 text-right focus:outline-none focus:ring-0 bg-transparent text-xl"
          onChange={handleChange}
          value={inputValue}
          placeholder={`0.${"0".repeat(DEFAULT_MAX_DECIMALS)}`}
        />
      </div>
      {isBeyondMax && (
        <p className="text-red-500 text-xs text-center">
          Your balance is {currentBalance}
        </p>
      )}
    </>
  );
};

export default TokenAmountInput;
