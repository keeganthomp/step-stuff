import TokenAmountInput from "@/components/TokenAmountInput";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useWalletBalances } from "@/context/WalletBalancesContext";
import { formatTokenAmount, getAtomicUnits } from "@/utils/token";
import { useToast } from "@/hooks/use-toast";
import { useStakingProgram } from "@/context/StakingProgramContext";
import Loader from "@/components/ui/loader";

export default function UnstakeForm() {
  const {
    balances,
    isFetching,
    refetch: refetchBalances,
  } = useWalletBalances();
  const [amountToUnstake, setAmountToUnstake] = useState(0);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const { unstake } = useStakingProgram();
  const { toast } = useToast();

  // TODO: optimize this - so it runs more efficiently
  useEffect(() => {
    refetchBalances();
  }, []);

  const xStepTokenInfo = balances?.xstep;

  const handleAmountChange = (amount: number) => {
    setAmountToUnstake(amount);
  };

  const handleUnstake = async () => {
    try {
      setIsUnstaking(true);
      const atomicUnits = getAtomicUnits(
        amountToUnstake,
        xStepTokenInfo?.decimals ?? 0
      );
      await unstake(atomicUnits);
      setIsUnstaking(false);
      toast({
        variant: "default",
        title: "Stake",
        description: `Unstaked ${amountToUnstake} xSTEP successfully!`,
      });
      refetchBalances();
      setAmountToUnstake(0);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to unstake",
      });
    } finally {
      setIsUnstaking(false);
    }
  };

  if (isFetching && !balances) {
    return (
      <div>
        <p>Fetching token balances...</p>
      </div>
    );
  }

  const xStepBalance = xStepTokenInfo?.balance ?? 0;
  const formattedCurrentBalance = formatTokenAmount(
    xStepBalance,
    balances?.xstep.decimals
  );
  const isBeyondMax = Number(amountToUnstake) > Number(formattedCurrentBalance);
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full justify-end px-2 pb-1">
        <p className="text-xs text-muted-foreground">
          Current xSTEP balance: {formattedCurrentBalance}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <TokenAmountInput
          image="/images/tokens/xstep.png"
          onChange={handleAmountChange}
          value={amountToUnstake}
          currentBalance={formattedCurrentBalance}
        />
        <Button
          onClick={handleUnstake}
          disabled={amountToUnstake === 0 || isUnstaking || isBeyondMax}
        >
          {isUnstaking ? <Loader /> : "Unstake"}
        </Button>
      </div>
    </div>
  );
}
