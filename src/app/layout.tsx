import "./globals.css";
import type { Metadata } from "next";
import { Roboto_Mono } from "next/font/google";

// app providers
import AppWalletProvider from "../context/WalletProviderContext";
import { WalletBalancesProvider } from "../context/WalletBalancesContext";
import { StakingProgramProvider } from "../context/StakingProgramContext";

import { Toaster } from "@/components/ui/toaster";

import Header from "../components/layout/Header";

export const metadata: Metadata = {
  title: "Step Staker",
  description: "Stake and unstake your STEP tokens",
};

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={robotoMono.className}>
      <body className="bg-[#fafafa]">
        <Header />
        <main className="px-4">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}

// wrap root layout with any global providers
export default function RootLayoutWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppWalletProvider>
      <WalletBalancesProvider>
        <StakingProgramProvider>
          <RootLayout>{children}</RootLayout>
        </StakingProgramProvider>
      </WalletBalancesProvider>
    </AppWalletProvider>
  );
}
