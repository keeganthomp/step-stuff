"use client";

import "@solana/wallet-adapter-react-ui/styles.css";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

const mainnetRpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL as string;

if (!mainnetRpcUrl) {
  throw new Error("MAINNET_RPC_URL is not set");
}

export default function AppWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = mainnetRpcUrl;
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
