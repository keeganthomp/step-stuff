import TokenAmountInput from "@/components/TokenAmountInput";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useWalletBalances } from "@/context/WalletBalancesContext";
import { formatTokenAmount, getAtomicUnits } from "@/utils/token";
import { useToast } from "@/hooks/use-toast";
import { useStakingProgram } from "@/context/StakingProgramContext";
import Loader from "@/components/ui/loader";
import { useStepTokenPrice } from "@/hooks/useStepTokenPrice";
import { calculateAmtIn } from "@/utils/token";
import Image from "next/image";

const ReceiveInfo = ({ amount }: { amount?: number | string }) => {
  const fmtAmount = amount ? amount : 0;
  const roundedAmount = Number(fmtAmount).toFixed(2);

  const TokenInfo = () => {
    return (
      <div className="flex items-center gap-1">
        <Image
          src="/images/tokens/xstep.png"
          alt="xSTEP"
          width={20}
          height={20}
        />
        <p>xSTEP</p>
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
  const { stepPerXstep } = useStepTokenPrice();
  const hasFetchedBal = useRef(false);

  useEffect(() => {
    if (hasFetchedBal.current === false) {
      refetchBalances();
      return () => {
        hasFetchedBal.current = true;
      };
    }
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
      <div className="flex items-center justify-center">
        <p className="text-gray-600 text-sm">Fetching token balances...</p>
      </div>
    );
  }

  const xStepToReceive = calculateAmtIn(
    amountToStake,
    stepPerXstep ?? 0,
    balances?.step.decimals ?? 0,
    balances?.xstep.decimals ?? 0
  );
  const stepBalance = stepTokenInfo?.balance ?? 0;
  const formattedCurrentBalance = formatTokenAmount(
    stepBalance,
    balances?.step.decimals
  );
  const isBeyondMax = Number(amountToStake) > Number(formattedCurrentBalance);
  return (
    <div className="w-full">
      <div className="flex w-full justify-end px-2 pb-1">
        <p className="text-xs text-muted-foreground">
          Current STEP balance: {formattedCurrentBalance}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <TokenAmountInput
          disabled={isStaking}
          image="/images/tokens/step.png"
          symbol="STEP"
          onChange={handleAmountChange}
          value={amountToStake}
          currentBalance={formattedCurrentBalance}
        />
        <ReceiveInfo amount={xStepToReceive} />
        <Button
          onClick={handleStake}
          disabled={amountToStake === 0 || isStaking || isBeyondMax}
          className="w-full h-12 text-sm uppercase tracking-wider"
        >
          {isStaking ? <Loader /> : "Stake"}
        </Button>
      </div>
    </div>
  );
}
