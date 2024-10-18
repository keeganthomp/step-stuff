"use client";

import ConnectWalletButton from "@/components/ConnectWalletButton";

function Header() {
  return (
    <div className="flex justify-end h-full px-4 py-2">
      <ConnectWalletButton />
    </div>
  );
}

export default function HeaderWrapper() {
  return (
    <div className="w-full fixed top-0 left-0 right-0 z-10 h-14 bg-white shadow-sm">
      <Header />
    </div>
  );
}
