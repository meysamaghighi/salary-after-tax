"use client";

import { useState } from "react";
import { countries } from "../lib/tax-engines";

function fmt(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

export default function ReverseCalculator({ countryCode }: { countryCode: string }) {
  const country = countries[countryCode];
  const [target, setTarget] = useState("");
  const [period, setPeriod] = useState<"annual" | "monthly">("monthly");

  const targetValue = parseFloat(target.replace(/,/g, "")) || 0;
  const targetAnnual = period === "monthly" ? targetValue * 12 : targetValue;

  // Binary search for the gross salary that gives us the target net
  function findGross(targetNet: number): number {
    if (targetNet <= 0) return 0;
    let low = targetNet;
    let high = targetNet * 3;
    // Expand upper bound if needed
    while (country.calculate(high).netAnnual < targetNet) {
      high *= 2;
    }
    for (let i = 0; i < 50; i++) {
      const mid = (low + high) / 2;
      const result = country.calculate(mid);
      if (result.netAnnual < targetNet) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return Math.round((low + high) / 2);
  }

  const requiredGross = findGross(targetAnnual);
  const result = requiredGross > 0 ? country.calculate(requiredGross) : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-8">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Reverse Calculator: What salary do I need?
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Enter your desired take-home pay to find the gross salary you need.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Desired Take-Home ({country.currencySymbol})
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={target}
            onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder={period === "monthly" ? "e.g. 4000" : "e.g. 50000"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as "annual" | "monthly")}
            className="px-4 py-3 text-lg border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
          </select>
        </div>
      </div>

      {result && targetAnnual > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-1">You need a gross salary of</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
            {fmt(requiredGross, country.currencySymbol)}<span className="text-base font-normal">/year</span>
          </p>
          <p className="text-lg text-blue-600 dark:text-blue-500 mt-1">
            {fmt(Math.round(requiredGross / 12), country.currencySymbol)}<span className="text-sm font-normal">/month gross</span>
          </p>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Tax: {fmt(result.totalTax, country.currencySymbol)} ({result.effectiveRate}% effective rate)</p>
            <p>Net: {fmt(result.netAnnual, country.currencySymbol)}/year = {fmt(result.netMonthly, country.currencySymbol)}/month</p>
          </div>
        </div>
      )}
    </div>
  );
}
