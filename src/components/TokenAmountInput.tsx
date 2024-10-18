import Image from "next/image";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TokenAmountInputProps {
  image: string;
  disabled?: boolean;
  symbol?: string;
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

const PrefixedAmountButton = ({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) => {
  return (
    <button
      className={cn(
        "px-2 py-1 rounded-md text-gray-600 text-[10px] uppercase text-white bg-gray-400"
      )}
      onClick={onPress}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

const TokenAmountInput: React.FC<TokenAmountInputProps> = ({
  image,
  symbol,
  disabled,
  onChange,
  value,
  currentBalance,
}) => {
  const [inputValue, setInputValue] = useState("");

  const setMax = () => {
    if (!currentBalance) return;
    setInputValue(currentBalance?.toString() || "");
    onChange(Number(currentBalance));
  };

  const setHalf = () => {
    if (!currentBalance) return;
    setInputValue((Number(currentBalance) / 2).toString() || "");
    onChange(Number(currentBalance) / 2);
  };

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
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-end gap-1">
        <PrefixedAmountButton
          label="Half"
          onPress={setHalf}
          disabled={disabled}
        />
        <PrefixedAmountButton
          label="Max"
          onPress={setMax}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center justify-between bg-gray-200 px-5 py-4 relative rounded-lg gap-2">
        <Image
          src={image}
          alt="token-logo"
          width={TOKEN_IMAGE_SIZE}
          height={TOKEN_IMAGE_SIZE}
        />
        {symbol && <p className="text-gray-600 text-sm">{symbol}</p>}
        <input
          type="text"
          disabled={disabled}
          className="border-0 rounded text-right focus:outline-none focus:ring-0 bg-transparent text-2xl w-full"
          onChange={handleChange}
          value={inputValue}
          placeholder={`0.${"0".repeat(DEFAULT_MAX_DECIMALS)}`}
        />
      </div>
      {isBeyondMax && (
        <p className="text-red-500 text-xs text-center">
          Your balance is only {currentBalance}
        </p>
      )}
    </div>
  );
};

export default TokenAmountInput;
