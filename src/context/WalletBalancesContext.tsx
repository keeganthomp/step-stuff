"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface TokenInfo {
  symbol: string;
  balance: string;
  decimals: number;
}

type TokenBalance = {
  step: TokenInfo;
  xstep: TokenInfo;
};

interface WalletBalancesContextType {
  solBalance: number | null;
  balances: TokenBalance | null;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const WalletBalancesContext = createContext<
  WalletBalancesContextType | undefined
>(undefined);

export const useWalletBalances = () => {
  const context = useContext(WalletBalancesContext);
  if (!context) {
    throw new Error(
      "useWalletBalances must be used within a WalletBalancesProvider"
    );
  }
  return context;
};

interface WalletBalancesProviderProps {
  children: ReactNode;
}

export const WalletBalancesProvider: React.FC<WalletBalancesProviderProps> = ({
  children,
}) => {
  const { connection } = useConnection();
  const { publicKey: connectedWallet } = useWallet();

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [balances, setBalances] = useState<TokenBalance | null>(null);

  const hasRunEffect = useRef(false);

  // fetch sol balance
  const fetchSolBalance = async () => {
    if (!connectedWallet) return;
    const newBalance = await connection.getBalance(connectedWallet);
    setSolBalance(newBalance / LAMPORTS_PER_SOL);
  };
  // fetch token balances
  const fetchTokenBalances = async () => {
    if (!connectedWallet) return;
    const tokenBalResp = await fetch(
      `/api/token-balances/${connectedWallet.toBase58()}`
    );
    if (!tokenBalResp.ok) {
      throw new Error("Failed to fetch token balances");
    }
    const { balances: tokenBalances } = await tokenBalResp.json();
    setBalances(tokenBalances);
  };
  // fetch balances for connected wallet
  const fetchBalances = async () => {
    try {
      setIsFetching(true);
      await fetchSolBalance();
      await fetchTokenBalances();
    } catch (error) {
      console.error("Error fetching balances:", error);
      setError("Error fetching balances");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!connectedWallet) {
      // Reset hasRunEffect when the wallet disconnects
      hasRunEffect.current = false;
    }

    if (connection && connectedWallet && !hasRunEffect.current) {
      fetchBalances();
    }
  }, [connection, connectedWallet]);

  const refetch = async () => {
    await fetchBalances();
  };

  return (
    <WalletBalancesContext.Provider
      value={{ balances, solBalance, isFetching, error, refetch }}
    >
      {children}
    </WalletBalancesContext.Provider>
  );
};
