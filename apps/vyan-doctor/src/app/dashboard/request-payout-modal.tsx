"use client";
import * as React from "react";
import { useState } from "react";
import { api } from "~/trpc/react";

interface RequestPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess: () => void;
}

const RequestPayoutModal = ({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}: RequestPayoutModalProps) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const requestPayout = api.earnings.requestPayout.useMutation({
    onSuccess: () => {
      setAmount("");
      setError("");
      onSuccess();
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (isNaN(amountInCents) || amountInCents < 100) {
      setError("Minimum payout amount is ₹1");
      return;
    }

    if (amountInCents > availableBalance) {
      setError(`Amount exceeds available balance (${formatCurrency(availableBalance)})`);
      return;
    }

    requestPayout.mutate({ amountInCents });
  };

  const handleMaxClick = () => {
    setAmount((availableBalance / 100).toString());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Request Payout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Available Balance */}
        <div className="bg-green-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-600 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(availableBalance)}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount to withdraw
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                className="w-full pl-8 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleMaxClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success state after mutation */}
          {requestPayout.isSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">
                Payout request submitted successfully! It will be reviewed by the admin.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={requestPayout.isPending || !amount}
              className="flex-1 py-3 px-4 bg-[#2AA852] hover:bg-[#238F46] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {requestPayout.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Request Payout"
              )}
            </button>
          </div>
        </form>

        {/* Info */}
        <p className="text-xs text-gray-400 text-center mt-4">
          Payouts are typically processed within 2-3 business days after approval.
        </p>
      </div>
    </div>
  );
};

export default RequestPayoutModal;
