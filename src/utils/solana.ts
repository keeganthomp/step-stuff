import {
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import * as anchor from "@coral-xyz/anchor";

export const doesAtaExist = async (
  connection: anchor.web3.Connection,
  mint: anchor.web3.PublicKey,
  wallet: anchor.web3.PublicKey
) => {
  try {
    const tokenAta = await getAssociatedTokenAddress(mint, wallet);
    const existingTokenAccount = await getAccount(connection, tokenAta);
    return !!existingTokenAccount;
  } catch (error: any) {
    // for now, we are assuming if this errors, then the ATA does not exist
    return false;
  }
};

export const makeCreateAtaInstruction = async (
  mint: anchor.web3.PublicKey,
  wallet: anchor.web3.PublicKey
) => {
  const tokenAta = await getAssociatedTokenAddress(mint, wallet);
  return createAssociatedTokenAccountInstruction(
    wallet,
    tokenAta,
    wallet,
    mint
  );
};
