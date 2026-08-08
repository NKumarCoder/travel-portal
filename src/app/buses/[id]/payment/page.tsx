"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBusBookingStore } from "@/store/bus-booking-store";
import { getPaymentMethods, type PaymentMethod } from "@/services/bus-service";
import { useBookingGuard } from "@/hooks/use-booking-guard";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Lock,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  Calendar,
  CheckCircle2,
  Shield,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  smartphone: <Smartphone className="h-5 w-5" />,
  "credit-card": <CreditCard className="h-5 w-5" />,
  building: <Building2 className="h-5 w-5" />,
  wallet: <Wallet className="h-5 w-5" />,
  calendar: <Calendar className="h-5 w-5" />,
};

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const busId = params.id as string;

  // Route guard: require seats
  const { isReady } = useBookingGuard(["seats"], busId);

  const {
    selectedSeats,
    getTotalAmount,
    getBaseFare,
    getTaxes,
    getConvenienceFee,
  } = useBusBookingStore();

  const total = getTotalAmount();
  const [methods, setMethods] = React.useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = React.useState<string | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState(false);

  // Load payment methods when ready
  React.useEffect(() => {
    if (isReady && selectedSeats.length > 0) {
      loadPaymentMethods();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  async function loadPaymentMethods() {
    const data = await getPaymentMethods();
    setMethods(data);
    setIsLoading(false);
  }

  const handlePay = async () => {
    if (!selectedMethod) return;
    setIsProcessing(true);
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 2500));
    router.push(`/buses/${encodeURIComponent(busId)}/confirmation`);
  };

  if (!isReady || selectedSeats.length === 0) return null;

  if (isProcessing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="mt-4 text-base font-medium text-gray-900">Processing Payment...</p>
          <p className="mt-1 text-sm text-gray-500">Please do not press back or refresh</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-6">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Go back" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <div>
                <h1 className="text-base font-semibold text-gray-900">Payment</h1>
                <p className="text-xs text-gray-500">Secure checkout</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-green-600">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">256-bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex gap-6">
          {/* Left: Payment Methods */}
          <div className="min-w-0 flex-1">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Choose Payment Method
            </h2>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {methods.map((method) => (
                  <div key={method.id} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    {/* Method header */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMethod(method.id);
                        setSelectedOption(method.options[0]?.id || method.id);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors",
                        selectedMethod === method.id
                          ? "bg-blue-50 ring-2 ring-blue-500"
                          : "hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        selectedMethod === method.id ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"
                      )}>
                        {iconMap[method.icon] || <CreditCard className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{method.label}</p>
                        <p className="text-xs text-gray-500">{method.description}</p>
                      </div>
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        selectedMethod === method.id
                          ? "border-blue-600 bg-blue-600"
                          : "border-gray-300"
                      )}>
                        {selectedMethod === method.id && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                    </button>

                    {/* Expanded options */}
                    {selectedMethod === method.id && method.options.length > 0 && (
                      <div className="border-t border-gray-100 px-4 py-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          {method.options.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedOption(opt.id)}
                              className={cn(
                                "flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-left text-sm transition-colors",
                                selectedOption === opt.id
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-200 text-gray-700 hover:border-gray-300"
                              )}
                            >
                              {selectedOption === opt.id && (
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                              )}
                              <span>{opt.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Desktop pay button */}
            <div className="mt-6 hidden lg:block">
              <Button
                size="lg"
                className="w-full gap-2"
                disabled={!selectedMethod}
                onClick={handlePay}
              >
                <Lock className="h-4 w-4" />
                Pay ₹{total.toLocaleString("en-IN")}
              </Button>
            </div>
          </div>

          {/* Right: Fare summary */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Fare Summary</h3>
              <div className="space-y-2">
                <FareRow label={`Base Fare (${selectedSeats.length} seat${selectedSeats.length > 1 ? "s" : ""})`} value={getBaseFare()} />
                <FareRow label="Taxes (5%)" value={getTaxes()} />
                <FareRow label="Convenience Fee" value={getConvenienceFee()} />
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-base font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <p className="mt-3 text-center text-[10px] text-gray-400">
                By proceeding you agree to our Terms & Conditions
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white p-4 shadow-lg lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-lg font-bold text-gray-900">₹{total.toLocaleString("en-IN")}</p>
          </div>
          <Button disabled={!selectedMethod} onClick={handlePay} className="gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            Pay Now
          </Button>
        </div>
      </div>
    </div>
  );
}

function FareRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="text-gray-900">₹{value.toLocaleString("en-IN")}</span>
    </div>
  );
}
