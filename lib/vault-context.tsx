"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BrowserProvider, JsonRpcProvider, FetchRequest, Contract, formatEther, parseEther } from "ethers";
import { useWallet } from "@/lib/wallet-context";
import {
  ADDRESSES,
  VAULT_ABI,
  STRATEGY_ABI,
  STRATEGY_META,
  MONAD_TESTNET_RPC,
} from "@/lib/contracts";

export interface Strategy {
  name: string;
  address: string;
  allocation: number;
  apy: number;
  risk: number;
  balance: string;
}

export interface VaultData {
  balance: string;
  userBalance: string;
  userShares: string;
  apy: number;
  riskScore: number;
  strategies: Strategy[];
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "rebalance";
  amount?: string;
  description: string;
  timestamp: Date;
}

interface VaultContextValue {
  vault: VaultData;
  transactions: Transaction[];
  isLoading: boolean;
  deposit: (amount: string) => Promise<void>;
  withdraw: () => Promise<void>;
  refresh: () => Promise<void>;
}

const EMPTY_VAULT: VaultData = {
  balance: "0",
  userBalance: "0",
  userShares: "0",
  apy: 0,
  riskScore: 0,
  strategies: [],
};

const VaultContext = createContext<VaultContextValue | null>(null);

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}

function getProvider(): BrowserProvider | null {
  const ethereum = (window as unknown as { ethereum?: object }).ethereum;
  if (!ethereum) return null;
  return new BrowserProvider(ethereum as never);
}

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const [vault, setVault] = useState<VaultData>(EMPTY_VAULT);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addTransaction = useCallback(
    (type: Transaction["type"], description: string, amount?: string) => {
      setTransactions((prev) => [
        {
          id: Math.random().toString(36).slice(2, 10),
          type,
          amount,
          description,
          timestamp: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    },
    []
  );

  const refresh = useCallback(async () => {
    // Use public RPC for reads with static network and batchMaxCount=1
    const fetchReq = new FetchRequest(MONAD_TESTNET_RPC);
    fetchReq.setHeader("Content-Type", "application/json");
    const provider = new JsonRpcProvider(fetchReq, {
      chainId: 10143,
      name: "monad-testnet",
    }, { staticNetwork: true, batchMaxCount: 1 });

    try {
      const vaultContract = new Contract(ADDRESSES.vault, VAULT_ABI, provider);

      const [totalVal, stratCount] = await Promise.all([
        vaultContract.totalValue(),
        vaultContract.strategyCount(),
      ]);

      let userVal = BigInt(0);
      let userSharesVal = BigInt(0);
      if (address) {
        [userVal, userSharesVal] = await Promise.all([
          vaultContract.userValue(address),
          vaultContract.shares(address),
        ]);
      }

      const count = Number(stratCount);
      const strategies: Strategy[] = [];
      let totalWeightedApy = 0;
      let totalWeightedRisk = 0;

      for (let i = 0; i < count; i++) {
        const [stratAddr, weight] = await vaultContract.strategies(i);
        const stratContract = new Contract(
          stratAddr as string,
          STRATEGY_ABI,
          provider
        );

        const [apyBps, risk, balance] = await Promise.all([
          stratContract.apyBps(),
          stratContract.riskScore(),
          stratContract.totalBalance(),
        ]);

        const meta = STRATEGY_META.find(
          (s) => s.address.toLowerCase() === (stratAddr as string).toLowerCase()
        );
        const allocation = Number(weight) / 100;
        const apyNum = Number(apyBps) / 100;
        const riskNum = Number(risk);

        strategies.push({
          name: meta?.name ?? `Strategy ${i}`,
          address: stratAddr as string,
          allocation,
          apy: apyNum,
          risk: riskNum,
          balance: formatEther(balance),
        });

        totalWeightedApy += apyNum * allocation;
        totalWeightedRisk += riskNum * allocation;
      }

      const totalAllocation = strategies.reduce(
        (sum, s) => sum + s.allocation,
        0
      );

      setVault({
        balance: formatEther(totalVal),
        userBalance: formatEther(userVal),
        userShares: formatEther(userSharesVal),
        apy:
          totalAllocation > 0
            ? Math.round((totalWeightedApy / totalAllocation) * 10) / 10
            : 0,
        riskScore:
          totalAllocation > 0
            ? Math.round((totalWeightedRisk / totalAllocation) * 10) / 10
            : 0,
        strategies,
      });
    } catch (err) {
      console.error("Failed to read vault:", err);
    }
  }, [address]);

  const deposit = useCallback(
    async (amount: string) => {
      const provider = getProvider();
      if (!provider) return;

      setIsLoading(true);
      try {
        const signer = await provider.getSigner();
        const vaultContract = new Contract(
          ADDRESSES.vault,
          VAULT_ABI,
          signer
        );
        const tx = await vaultContract.deposit({ value: parseEther(amount) });
        await tx.wait();
        addTransaction("deposit", `Deposited ${amount} MON`, amount);
        await refresh();
      } catch (err) {
        console.error("Deposit failed:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [addTransaction, refresh]
  );

  const withdraw = useCallback(async () => {
    const provider = getProvider();
    if (!provider) return;

    setIsLoading(true);
    try {
      const signer = await provider.getSigner();
      const vaultContract = new Contract(ADDRESSES.vault, VAULT_ABI, signer);
      const tx = await vaultContract.withdraw();
      await tx.wait();
      addTransaction("withdraw", `Withdrawn all funds`);
      await refresh();
    } catch (err) {
      console.error("Withdraw failed:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [addTransaction, refresh]);

  // Refresh on mount and when address changes
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <VaultContext.Provider
      value={{ vault, transactions, isLoading, deposit, withdraw, refresh }}
    >
      {children}
    </VaultContext.Provider>
  );
}
