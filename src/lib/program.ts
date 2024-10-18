import { XSTEP_PROGRAM_ID } from "@/constants";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { StepStakingJSON } from "@/lib/idl";

export const programId = new PublicKey(XSTEP_PROGRAM_ID);

export const getStakingProgram = (connection?: anchor.web3.Connection) => {
  if (!connection) {
    throw new Error("Connection is required to initialize the program");
  }
  const stakingProgram = new anchor.Program(
    StepStakingJSON,
    new PublicKey(XSTEP_PROGRAM_ID),
    {
      connection,
    }
  );
  return stakingProgram;
};
