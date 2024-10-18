import { useStakingProgram } from "@/context/StakingProgramContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState, useEffect, useCallback } from "react";

export const useStepTokenPrice = () => {
  const { getStepTokPrice } = useStakingProgram();
  const { publicKey: connectedWallet } = useWallet();
  const [stepPerXstep, setStepPerXstep] = useState<number | null>(null);

  const fetchPrice = useCallback(async () => {
    try {
      const tokPrices = await getStepTokPrice();
      setStepPerXstep(tokPrices?.stepPerXstep || null);
    } catch (error) {
      console.error("Error fetching STEP token price:", error);
      setStepPerXstep(null);
    }
  }, [connectedWallet, getStepTokPrice]);

  useEffect(() => {
    if (connectedWallet) {
      fetchPrice();
    }
  }, [fetchPrice, connectedWallet]);

  return { stepPerXstep };
};
