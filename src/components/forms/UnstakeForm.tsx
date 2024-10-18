import TokenAmountInput from "@/components/TokenAmountInput";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useWalletBalances } from "@/context/WalletBalancesContext";
import { formatTokenAmount, getAtomicUnits } from "@/utils/token";
import { useToast } from "@/hooks/use-toast";
import { useStakingProgram } from "@/context/StakingProgramContext";
import Loader from "@/components/ui/loader";
import Image from "next/image";
import { calculateAmtOut } from "@/utils/token";
import { useStepTokenPrice } from "@/hooks/useStepTokenPrice";

const ReceiveInfo = ({ amount }: { amount?: number | string }) => {
  const fmtAmount = amount ? amount : 0;
  const roundedAmount = Number(fmtAmount).toFixed(2);

  const TokenInfo = () => {
    return (
      <div className="flex items-center gap-1">
        <Image
          src="/images/tokens/step.png"
          alt="STEP"
          width={24}
          height={24}
        />
        <p>STEP</p>
      </div>
    );
  };

  return (
    <div className="flex justify-end items-center">
      <div className="flex items-center gap-2">
        <p>
          <span className="text-sm text-gray-600">You will receive </span>
          {roundedAmount === "0" ? "0" : roundedAmount}
        </p>
        <TokenInfo />
      </div>
    </div>
  );
};

export default function UnstakeForm() {
  const {
    balances,
    isFetching,
    refetch: refetchBalances,
  } = useWalletBalances();
  const { stepPerXstep } = useStepTokenPrice();
  const [amountToUnstake, setAmountToUnstake] = useState(0);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const { unstake } = useStakingProgram();
  const { toast } = useToast();
  const hasFetchedBal = useRef(false);

  useEffect(() => {
    if (hasFetchedBal.current === false) {
      refetchBalances();
      return () => {
        hasFetchedBal.current = true;
      };
    }
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

  const stepToReceive = calculateAmtOut(
    amountToUnstake,
    stepPerXstep ?? 0,
    balances?.step.decimals ?? 0,
    balances?.xstep.decimals ?? 0
  );
  const xStepBalance = xStepTokenInfo?.balance ?? 0;
  const formattedCurrentBalance = formatTokenAmount(
    xStepBalance,
    balances?.xstep.decimals
  );
  const isBeyondMax = Number(amountToUnstake) > Number(formattedCurrentBalance);
  return (
    <div className="w-full">
      <div className="flex w-full justify-end px-2 pb-1">
        <p className="text-xs text-muted-foreground">
          Current xSTEP balance: {formattedCurrentBalance}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <TokenAmountInput
          disabled={isUnstaking}
          symbol="xSTEP"
          image="/images/tokens/xstep.png"
          onChange={handleAmountChange}
          value={amountToUnstake}
          currentBalance={formattedCurrentBalance}
        />
        <ReceiveInfo amount={stepToReceive} />
        <Button
          onClick={handleUnstake}
          disabled={amountToUnstake === 0 || isUnstaking || isBeyondMax}
          className="w-full h-12 text-sm uppercase tracking-wider"
        >
          {isUnstaking ? <Loader /> : "Unstake"}
        </Button>
      </div>
    </div>
  );
}
