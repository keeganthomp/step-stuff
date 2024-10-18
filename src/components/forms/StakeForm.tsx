import TokenAmountInput from "@/components/TokenAmountInput";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useWalletBalances } from "@/context/WalletBalancesContext";
import { formatTokenAmount, getAtomicUnits } from "@/utils/token";
import { useToast } from "@/hooks/use-toast";
import { useStakingProgram } from "@/context/StakingProgramContext";
import Loader from "@/components/ui/loader";

export default function StakeForm() {
  const {
    balances,
    isFetching,
    refetch: refetchBalances,
  } = useWalletBalances();
  const [amountToStake, setAmountToStake] = useState(0);
  const [isStaking, setIsStaking] = useState(false);
  const { stake } = useStakingProgram();
  const { toast } = useToast();

  // TODO: optimize this - so it runs more efficiently
  useEffect(() => {
    refetchBalances();
  }, []);

  const stepTokenInfo = balances?.step;

  const handleAmountChange = (amount: number) => {
    setAmountToStake(amount);
  };

  const handleStake = async () => {
    try {
      setIsStaking(true);
      const atomicUnits = getAtomicUnits(
        amountToStake,
        stepTokenInfo?.decimals ?? 0
      );
      await stake(atomicUnits);
      setIsStaking(false);
      toast({
        variant: "default",
        title: "Stake",
        description: `Staked ${amountToStake} STEP successfully!`,
      });
      refetchBalances();
      setAmountToStake(0);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Stake failed",
      });
    } finally {
      setIsStaking(false);
    }
  };

  if (isFetching && !balances) {
    return (
      <div>
        <p>Fetching token balances...</p>
      </div>
    );
  }

  const stepBalance = stepTokenInfo?.balance ?? 0;
  const formattedCurrentBalance = formatTokenAmount(
    stepBalance,
    balances?.step.decimals
  );
  const isBeyondMax = Number(amountToStake) > Number(formattedCurrentBalance);
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full justify-end px-2 pb-1">
        <p className="text-xs text-muted-foreground">
          Current STEP balance: {formattedCurrentBalance}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <TokenAmountInput
          image="/images/tokens/step.png"
          onChange={handleAmountChange}
          value={amountToStake}
          currentBalance={formattedCurrentBalance}
        />
        <Button
          onClick={handleStake}
          disabled={amountToStake === 0 || isStaking || isBeyondMax}
        >
          {isStaking ? <Loader /> : "Stake"}
        </Button>
      </div>
    </div>
  );
}
