import { NextResponse } from "next/server";
import { STEP_TOKEN_MINT, XSTEP_TOKEN_MINT } from "@/constants";

const mainnetRpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL as string;

if (!mainnetRpcUrl) {
  throw new Error("MAINNET_RPC_URL is not set");
}

interface TokenInfo {
  symbol: string;
  balance: string;
  decimals?: number;
}

export async function GET(
  req: Request,
  { params }: { params: { wallet: string } }
) {
  const { wallet } = params;
  const response = await fetch(mainnetRpcUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${wallet}-${Date.now()}-token-balances4`,
      method: "searchAssets",
      params: {
        ownerAddress: wallet,
        tokenType: "fungible",
      },
    }),
  });
  if (!response.ok) {
    return NextResponse.json(
      { message: "Failed to fetch token balances" },
      { status: 500 }
    );
  }
  const { result } = await response.json();

  const stepTokenBalances: Record<string, TokenInfo> = result?.items?.reduce(
    (acc: { step: TokenInfo; xstep: TokenInfo }, item: any) => {
      const tokenInfo = item?.token_info;
      if (item?.id === STEP_TOKEN_MINT) {
        acc.step.balance = tokenInfo?.balance || 0;
        acc.step.decimals = tokenInfo?.decimals;
      }
      if (item?.id === XSTEP_TOKEN_MINT) {
        acc.xstep.balance = tokenInfo?.balance || 0;
        acc.xstep.decimals = tokenInfo?.decimals;
      }
      return acc;
    },
    {
      step: {
        symbol: "STEP",
        balance: "",
        decimals: undefined,
      },
      xstep: {
        symbol: "xSTEP",
        balance: "",
        decimals: undefined,
      },
    }
  );

  return NextResponse.json({ balances: stepTokenBalances });
}
