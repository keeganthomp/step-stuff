"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import StakeForm from "@/components/forms/StakeForm";
import UnstakeForm from "@/components/forms/UnstakeForm";
import { cn } from "@/lib/utils";
import WalletConnectionRequired from "@/components/WalletConnectionRequired";
import { useWalletBalances } from "@/context/WalletBalancesContext";
import Loader from "@/components/ui/loader";

const StakeToggleButton = ({
  isActive,
  onClick,
  label,
}: {
  isActive: boolean;
  onClick: () => void;
  label: string;
}) => {
  return (
    <Button
      className={cn(
        "shadow-none hover:bg-transparent hover:text-gray-700 rounded-none bg-transparent w-full h-full border-b-2",
        {
          "border-gray-800 text-gray-800": isActive,
          "border-transparent text-gray-300": !isActive,
        }
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  );
};

const StakeToggler = ({
  isStaking,
  setIsStaking,
}: {
  isStaking: boolean;
  setIsStaking: (isStaking: boolean) => void;
}) => {
  const goToStake = () => {
    setIsStaking(true);
  };
  const goToUnstake = () => {
    setIsStaking(false);
  };

  return (
    <div className="flex items-center w-full h-14">
      <StakeToggleButton
        isActive={isStaking}
        onClick={goToStake}
        label="Stake"
      />
      <StakeToggleButton
        isActive={!isStaking}
        onClick={goToUnstake}
        label="Unstake"
      />
    </div>
  );
};

export default function Home() {
  const { balances, isFetching } = useWalletBalances();
  const { publicKey: connectedWallet } = useWallet();
  const [isStaking, setIsStaking] = useState(true);

  if (!connectedWallet) return <WalletConnectionRequired />;

  if (isFetching && !balances) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader />
        <p className="text-gray-600 text-sm">Fetching token balances...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full md:max-w-md bg-gray-100 rounded-xl pb-4 overflow-hidden flex flex-col gap-6">
        <StakeToggler isStaking={isStaking} setIsStaking={setIsStaking} />
        <div className="px-4">
          {isStaking ? <StakeForm /> : <UnstakeForm />}
        </div>
      </div>
    </div>
  );
}
