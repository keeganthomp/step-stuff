"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import StakeForm from "@/components/forms/StakeForm";
import UnstakeForm from "@/components/forms/UnstakeForm";

export default function Home() {
  const { publicKey: connectedWallet } = useWallet();
  const [isStaking, setIsStaking] = useState(true);

  if (!connectedWallet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Connect your wallet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex justify-center gap-5 pb-8">
        <Button
          className={`shadow-none hover:bg-gray-100 text-gray-500 rounded-none ${
            isStaking
              ? "bg-gray-50 border-b-2 border-gray-500"
              : "bg-transparent"
          }`}
          onClick={() => setIsStaking(true)}
        >
          Stake
        </Button>
        <Button
          className={`shadow-none hover:bg-gray-100 text-gray-500 rounded-none ${
            !isStaking
              ? "bg-gray-50 border-b-2 border-gray-500"
              : "bg-transparent"
          }`}
          onClick={() => setIsStaking(false)}
        >
          Unstake
        </Button>
      </div>
      {isStaking ? <StakeForm /> : <UnstakeForm />}
    </div>
  );
}
