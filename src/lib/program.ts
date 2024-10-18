import { XSTEP_PROGRAM_ID } from "@/constants";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { StepStakingJSON } from "@/lib/idl";
import { AnchorWallet } from "@solana/wallet-adapter-react";

export const programId = new PublicKey(XSTEP_PROGRAM_ID);

export const getStakingProgram = (
  connection: anchor.web3.Connection,
  wallet: AnchorWallet
) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const stakingProgram = new anchor.Program(
    StepStakingJSON,
    new PublicKey(XSTEP_PROGRAM_ID),
    provider
  );
  return stakingProgram;
};
