"use client";

import { useState } from "react";
import { countries } from "../lib/tax-engines";
import type { TaxBreakdown } from "../lib/tax-engines";

function formatCurrency(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

function TaxBar({ brackets, gross }: { brackets: TaxBreakdown["brackets"]; gross: number }) {
  if (gross <= 0) return null;
  return (
    <div className="w-full mt-6">
      <div className="flex w-full h-10 rounded-lg overflow-hidden">
        {brackets.map((b) => {
          const pct = (b.amount / gross) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={b.label}
              style={{ width: `${pct}%`, backgroundColor: b.color }}
              className="flex items-center justify-center text-white text-xs font-medium min-w-[2rem]"
              title={`${b.label}: ${pct.toFixed(1)}%`}
            >
              {pct > 8 ? `${pct.toFixed(1)}%` : ""}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        {brackets.map((b) => (
          <div key={b.label} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: b.color }} />
            <span className="text-gray-600 dark:text-gray-400">{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TaxCalculator({ countryCode }: { countryCode: string }) {
  const country = countries[countryCode];
  const [salary, setSalary] = useState(country.defaultSalary.toString());
  const [period, setPeriod] = useState<"annual" | "monthly">("annual");

  const inputValue = parseFloat(salary.replace(/,/g, "")) || 0;
  const annualGross = period === "monthly" ? inputValue * 12 : inputValue;
  const result = country.calculate(annualGross);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gross Salary ({country.currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={salary}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setSalary(val);
              }}
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder={`e.g. ${country.defaultSalary.toLocaleString()}`}
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
              <option value="annual">Annual</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        {annualGross > 0 && (
          <>
            <TaxBar brackets={result.brackets} gross={result.grossAnnual} />

            <div className="grid grid-cols-2 gap-4 mt-6">
              <ResultCard
                label="Gross Annual"
                value={formatCurrency(result.grossAnnual, country.currencySymbol)}
              />
              <ResultCard
                label={country.taxLabels.federal}
                value={formatCurrency(result.federalTax, country.currencySymbol)}
                negative
              />
              <ResultCard
                label={country.taxLabels.social}
                value={formatCurrency(result.socialSecurity, country.currencySymbol)}
                negative
              />
              <ResultCard
                label="Effective Tax Rate"
                value={`${result.effectiveRate}%`}
              />
              <ResultCard
                label="Net Annual"
                value={formatCurrency(result.netAnnual, country.currencySymbol)}
                highlight
              />
              <ResultCard
                label="Net Monthly"
                value={formatCurrency(result.netMonthly, country.currencySymbol)}
                highlight
              />
            </div>
          </>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Based on {country.taxYear} federal tax rates for {country.name}.
        Does not include state/provincial taxes. For estimation only.
      </p>
    </div>
  );
}

function ResultCard({
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
    <div
      className={`rounded-xl p-4 ${
        highlight
          ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          : "bg-gray-50 dark:bg-gray-800"
      }`}
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p
        className={`text-xl font-semibold mt-1 ${
          negative
            ? "text-red-600 dark:text-red-400"
            : highlight
            ? "text-green-700 dark:text-green-400"
            : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {negative ? `- ${value}` : value}
      </p>
    </div>
  );
}
