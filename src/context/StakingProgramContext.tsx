"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import { Transaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { programId } from "@/lib/program";
import { STEP_TOKEN_MINT, XSTEP_TOKEN_MINT } from "@/constants";
import { getStakingProgram } from "@/lib/program";
import { makeCreateAtaInstruction, doesAtaExist } from "@/utils/solana";

interface StakingProgramContextType {
  stake: (amount: number) => Promise<string>;
  unstake: (amount: number) => Promise<string>;
  getStepTokPrice: () => Promise<{ stepPerXstep: number | null } | null>;
}

const StakingProgramContext = createContext<
  StakingProgramContextType | undefined
>(undefined);

export const useStakingProgram = () => {
  const context = useContext(StakingProgramContext);
  if (!context) {
    throw new Error(
      "useStakingProgram must be used within a StakingProgramProvider"
    );
  }
  return context;
};

interface StakingProgramProviderProps {
  children: ReactNode;
}

const stepMint = new anchor.web3.PublicKey(STEP_TOKEN_MINT);
const xStepMint = new anchor.web3.PublicKey(XSTEP_TOKEN_MINT);

const getVaultInfo = async () => {
  const vaultInfo = anchor.web3.PublicKey.findProgramAddressSync(
    [stepMint.toBuffer()],
    programId
  );
  return vaultInfo;
};

export const StakingProgramProvider: React.FC<StakingProgramProviderProps> = ({
  children,
}) => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey: connectedWallet } = useWallet();
  const anchorWallet = useAnchorWallet();

  const stake = async (amount: number) => {
    if (!connectedWallet || !anchorWallet) {
      throw new Error("No wallet connected");
    }
    const stakingTxn = new Transaction();
    // we know this ata exists as they will have to have the token to stake
    const stepTokenAta = await getAssociatedTokenAddress(
      stepMint,
      connectedWallet
    );
    // we may or may not have the xstep token ATA
    const xStepTokenAta = await getAssociatedTokenAddress(
      xStepMint,
      connectedWallet
    );
    const doesXStepAtaExist = await doesAtaExist(
      connection,
      xStepMint,
      connectedWallet
    );
    // if the xstep ata does not exist, we need to add the create ata instruction to the transaction
    if (!doesXStepAtaExist) {
      const createXStepAtaIx = await makeCreateAtaInstruction(
        xStepMint,
        connectedWallet
      );
      stakingTxn.add(createXStepAtaIx);
    }
    // get the staking program and vault info
    const stakingProgram = getStakingProgram(connection, anchorWallet);
    const [vaultPublicKey, vaultBump] = await getVaultInfo();
    // convert the amount to a BN
    const amountBN = new anchor.BN(amount);
    // build the stake transaction from the program
    const stakeIx = await stakingProgram.methods
      .stake(vaultBump, amountBN)
      .accounts({
        tokenVault: vaultPublicKey,
        tokenMint: stepMint,
        xTokenMint: xStepMint,
        tokenFrom: stepTokenAta,
        tokenFromAuthority: connectedWallet,
        xTokenTo: xStepTokenAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
    // add the stake instruction to the staking transaction
    stakingTxn.add(stakeIx);
    // sign and send the transaction
    const txnSig = await sendTransaction?.(stakingTxn, connection);

    console.log("Stake transaction sig:", txnSig);

    return txnSig;
  };

  const unstake = async (amount: number) => {
    if (!connectedWallet || !anchorWallet) {
      throw new Error("No wallet connected");
    }
    const unstakeTxn = new Transaction();
    // we may or may not have the step token ATA
    const stepTokenAta = await getAssociatedTokenAddress(
      stepMint,
      connectedWallet
    );
    // we know this ata exists as they will have to have the token to unstake
    const xStepTokenAta = await getAssociatedTokenAddress(
      xStepMint,
      connectedWallet
    );
    const doesStepAtaExist = await doesAtaExist(
      connection,
      stepMint,
      connectedWallet
    );
    // if the xstep ata does not exist, we need to add the create ata instruction to the transaction
    if (!doesStepAtaExist) {
      const createStepAtaIx = await makeCreateAtaInstruction(
        stepMint,
        connectedWallet
      );
      unstakeTxn.add(createStepAtaIx);
    }
    // get the staking program and vault info
    const stakingProgram = getStakingProgram(connection, anchorWallet);
    const [vaultPublicKey, vaultBump] = await getVaultInfo();
    // convert the amount to a BN
    const amountBN = new anchor.BN(amount);
    // build the unstake transaction from the program
    const unstakeIx = await stakingProgram.methods
      .unstake(vaultBump, amountBN)
      .accounts({
        tokenMint: stepMint,
        xTokenMint: xStepMint,
        tokenVault: vaultPublicKey,
        xTokenFrom: xStepTokenAta,
        xTokenFromAuthority: connectedWallet,
        tokenTo: stepTokenAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();
    // add the unstake instruction to the staking transaction
    unstakeTxn.add(unstakeIx);
    // sign and send the transaction
    const txnSig = await sendTransaction?.(unstakeTxn, connection);

    console.log("Unstake transaction sig:", txnSig);

    return txnSig;
  };

  const getStepTokPrice = async () => {
    if (!connectedWallet || !anchorWallet) {
      throw new Error("No wallet connected");
    }

    const stakingProgram = getStakingProgram(connection, anchorWallet);
    const [vaultPublicKey] = await getVaultInfo();
    // get price by simulating the emitPrice func
    const priceRes = await stakingProgram.simulate.emitPrice({
      accounts: {
        tokenMint: stepMint,
        xTokenMint: xStepMint,
        tokenVault: vaultPublicKey,
      },
    });
    const priceData = priceRes?.events[0].data;
    const rawXStepPrice = priceData?.stepPerXstep?.toString();

    const isXStepPriceNumber = !isNaN(Number(rawXStepPrice));

    const formattedXStepPrice = isXStepPriceNumber
      ? Number(rawXStepPrice)
      : null;

    return { stepPerXstep: formattedXStepPrice };
  };

  return (
    <StakingProgramContext.Provider value={{ stake, unstake, getStepTokPrice }}>
      {children}
    </StakingProgramContext.Provider>
  );
};
