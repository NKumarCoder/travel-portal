import { USE_MOCK_DATA } from "./config";
import { debugLog } from "@/lib/debug";

// ============================================================
// Mock Wallet System
// ============================================================

export interface WalletState {
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  timestamp: string;
  reference?: string;
}

export interface WalletPaymentResult {
  success: boolean;
  amountDeducted: number;
  remainingBalance: number;
  remainingPayable: number;
  message: string;
}

// In-memory wallet state (persists for session)
let walletData: WalletState = {
  balance: 500,
  currency: "INR",
  transactions: [
    {
      id: "txn-001",
      type: "credit",
      amount: 500,
      description: "Welcome bonus",
      timestamp: "2026-07-01T10:00:00Z",
    },
    {
      id: "txn-002",
      type: "credit",
      amount: 200,
      description: "Refund - Cancelled booking BK-12345",
      timestamp: "2026-07-05T14:30:00Z",
    },
    {
      id: "txn-003",
      type: "debit",
      amount: 200,
      description: "Bus booking BK-67890",
      timestamp: "2026-07-10T09:15:00Z",
    },
  ],
};

/**
 * Get current wallet balance and transactions.
 */
export async function getWallet(): Promise<WalletState> {
  if (USE_MOCK_DATA) {
    await delay(200);
  }
  debugLog("WALLET_FETCHED", { balance: walletData.balance });
  return { ...walletData };
}

/**
 * Use wallet balance for partial or full payment.
 * Returns how much was deducted and how much remains payable.
 */
export async function useWalletForPayment(
  orderAmount: number,
  useFullBalance: boolean = false
): Promise<WalletPaymentResult> {
  if (USE_MOCK_DATA) {
    await delay(400);
  }

  const available = walletData.balance;

  if (available <= 0) {
    debugLog("WALLET_EMPTY", { balance: 0 }, "warn");
    return {
      success: false,
      amountDeducted: 0,
      remainingBalance: 0,
      remainingPayable: orderAmount,
      message: "Wallet balance is ₹0. No deduction possible.",
    };
  }

  const amountToDeduct = useFullBalance
    ? Math.min(available, orderAmount)
    : Math.min(available, orderAmount);

  // Deduct from wallet
  walletData = {
    ...walletData,
    balance: walletData.balance - amountToDeduct,
    transactions: [
      {
        id: `txn-${Date.now()}`,
        type: "debit",
        amount: amountToDeduct,
        description: `Payment for booking`,
        timestamp: new Date().toISOString(),
      },
      ...walletData.transactions,
    ],
  };

  const remainingPayable = orderAmount - amountToDeduct;

  debugLog("WALLET_PAYMENT", {
    deducted: amountToDeduct,
    remainingBalance: walletData.balance,
    remainingPayable,
  }, "success");

  return {
    success: true,
    amountDeducted: amountToDeduct,
    remainingBalance: walletData.balance,
    remainingPayable,
    message:
      remainingPayable > 0
        ? `₹${amountToDeduct} deducted from wallet. Pay remaining ₹${remainingPayable}.`
        : `Full amount paid from wallet. ₹${amountToDeduct} deducted.`,
  };
}

/**
 * Add money to wallet (for testing/mock).
 */
export async function addToWallet(amount: number): Promise<WalletState> {
  if (USE_MOCK_DATA) {
    await delay(300);
  }

  walletData = {
    ...walletData,
    balance: walletData.balance + amount,
    transactions: [
      {
        id: `txn-${Date.now()}`,
        type: "credit",
        amount,
        description: "Added to wallet",
        timestamp: new Date().toISOString(),
      },
      ...walletData.transactions,
    ],
  };

  debugLog("WALLET_TOPUP", { added: amount, newBalance: walletData.balance }, "success");
  return { ...walletData };
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
