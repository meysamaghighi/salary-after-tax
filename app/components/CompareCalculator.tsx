"use client";

import { useState } from "react";
import { countries, countryOrder } from "../lib/tax-engines";

function fmt(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

function flagEmoji(countryCode: string): string {
  const codePoints = countryCode.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

export default function CompareCalculator() {
  const [country1, setCountry1] = useState("us");
  const [country2, setCountry2] = useState("uk");
  const [salary, setSalary] = useState("75000");

  const amount = parseFloat(salary.replace(/,/g, "")) || 0;
  const c1 = countries[country1];
  const c2 = countries[country2];
  const r1 = c1.calculate(amount);
  const r2 = c2.calculate(amount);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-8">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country 1</label>
          <select
            value={country1}
            onChange={(e) => setCountry1(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none"
          >
            {countryOrder.map((code) => (
              <option key={code} value={code}>{countries[code].name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Annual Salary</label>
          <input
            type="text"
            inputMode="numeric"
            value={salary}
            onChange={(e) => setSalary(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none text-center text-lg font-semibold"
            placeholder="75000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country 2</label>
          <select
            value={country2}
            onChange={(e) => setCountry2(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none"
          >
            {countryOrder.map((code) => (
              <option key={code} value={code}>{countries[code].name}</option>
            ))}
          </select>
        </div>
      </div>

      {amount > 0 && (
        <div className="grid grid-cols-2 gap-6">
          {/* Country 1 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
              {flagEmoji(c1.flag)} {c1.name}
            </h3>
            <CompareCard label="Gross" value={fmt(amount, c1.currencySymbol)} />
            <CompareCard label={c1.taxLabels.federal} value={fmt(r1.federalTax, c1.currencySymbol)} negative />
            {r1.socialSecurity > 0 && (
              <CompareCard label={c1.taxLabels.social} value={fmt(r1.socialSecurity, c1.currencySymbol)} negative />
            )}
            <CompareCard label="Total Tax" value={fmt(r1.totalTax, c1.currencySymbol)} negative />
            <CompareCard label="Tax Rate" value={`${r1.effectiveRate}%`} negative />
            <CompareCard label="Net Annual" value={fmt(r1.netAnnual, c1.currencySymbol)} highlight />
            <CompareCard label="Net Monthly" value={fmt(r1.netMonthly, c1.currencySymbol)} highlight />
          </div>

          {/* Country 2 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
              {flagEmoji(c2.flag)} {c2.name}
            </h3>
            <CompareCard label="Gross" value={fmt(amount, c2.currencySymbol)} />
            <CompareCard label={c2.taxLabels.federal} value={fmt(r2.federalTax, c2.currencySymbol)} negative />
            {r2.socialSecurity > 0 && (
              <CompareCard label={c2.taxLabels.social} value={fmt(r2.socialSecurity, c2.currencySymbol)} negative />
            )}
            <CompareCard label="Total Tax" value={fmt(r2.totalTax, c2.currencySymbol)} negative />
            <CompareCard label="Tax Rate" value={`${r2.effectiveRate}%`} negative />
            <CompareCard label="Net Annual" value={fmt(r2.netAnnual, c2.currencySymbol)} highlight />
            <CompareCard label="Net Monthly" value={fmt(r2.netMonthly, c2.currencySymbol)} highlight />
          </div>
        </div>
      )}

      {/* Difference summary */}
      {amount > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {r1.netAnnual > r2.netAnnual ? (
              <>
                You keep <strong className="text-blue-700 dark:text-blue-400">{fmt(r1.netAnnual - r2.netAnnual, "")}</strong> more
                per year in {c1.name} ({(r1.effectiveRate < r2.effectiveRate ? `${(r2.effectiveRate - r1.effectiveRate).toFixed(1)}% lower tax rate` : "despite higher tax rate, due to deduction differences")})
              </>
            ) : r2.netAnnual > r1.netAnnual ? (
              <>
                You keep <strong className="text-blue-700 dark:text-blue-400">{fmt(r2.netAnnual - r1.netAnnual, "")}</strong> more
                per year in {c2.name} ({(r2.effectiveRate < r1.effectiveRate ? `${(r1.effectiveRate - r2.effectiveRate).toFixed(1)}% lower tax rate` : "despite higher tax rate, due to deduction differences")})
              </>
            ) : (
              <>Same take-home pay in both countries</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function CompareCard({
  label,
  value,
  negative,
  highlight,
}: {
  label: string;
  value: string;
  negative?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? "bg-green-50 dark:bg-green-900/20" : "bg-gray-50 dark:bg-gray-800"}`}>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-lg font-semibold ${
        negative ? "text-red-600 dark:text-red-400" : highlight ? "text-green-700 dark:text-green-400" : "text-gray-900 dark:text-gray-100"
      }`}>
        {negative && !value.endsWith("%") ? `- ${value}` : value}
      </p>
    </div>
  );
}
