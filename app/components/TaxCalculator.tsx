"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { countries } from "../lib/tax-engines";
import type { TaxBreakdown } from "../lib/tax-engines";

function fmt(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

function TaxBar({ brackets, gross }: { brackets: TaxBreakdown["brackets"]; gross: number }) {
  if (gross <= 0) return null;
  return (
    <div className="w-full mt-6">
      <div className="flex w-full h-12 rounded-lg overflow-hidden shadow-inner">
        {brackets.map((b) => {
          const pct = (b.amount / gross) * 100;
          if (pct <= 0) return null;
          return (
            <div
              key={b.label}
              style={{ width: `${pct}%`, backgroundColor: b.color }}
              className="flex items-center justify-center text-white text-xs sm:text-sm font-semibold min-w-[2rem] transition-all duration-500"
              title={`${b.label}: ${fmt(b.amount, "")} (${pct.toFixed(1)}%)`}
            >
              {pct > 10 ? `${pct.toFixed(1)}%` : ""}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-3">
        {brackets.map((b) => (
          <div key={b.label} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: b.color }} />
            <span className="text-gray-600 dark:text-gray-400">
              {b.label}: {fmt(b.amount, "")}{" "}
              <span className="text-gray-400 dark:text-gray-500">
                ({((b.amount / gross) * 100).toFixed(1)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TaxCalculator({ countryCode }: { countryCode: string }) {
  const country = countries[countryCode];
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialSalary = searchParams.get("salary") || country.defaultSalary.toString();
  const initialPeriod = (searchParams.get("period") as "annual" | "monthly") || "annual";

  const [salary, setSalary] = useState(initialSalary);
  const [period, setPeriod] = useState<"annual" | "monthly">(initialPeriod);
  const [copied, setCopied] = useState(false);

  const inputValue = parseFloat(salary.replace(/,/g, "")) || 0;
  const annualGross = period === "monthly" ? inputValue * 12 : inputValue;
  const result = country.calculate(annualGross);

  useEffect(() => {
    if (inputValue > 0 && inputValue !== country.defaultSalary) {
      const url = `/${countryCode}?salary=${inputValue}&period=${period}`;
      router.replace(url, { scroll: false });
    }
  }, [inputValue, period, countryCode, country.defaultSalary, router]);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/${countryCode}?salary=${inputValue}&period=${period}`
    : "";

  function handleShare() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gross Salary ({country.currencySymbol})
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={salary}
              onChange={(e) => setSalary(e.target.value.replace(/[^0-9.]/g, ""))}
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

        {/* Popular salary quick picks */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-xs text-gray-400 dark:text-gray-500 self-center mr-1">Popular:</span>
          {country.popularSalaries.map((s) => (
            <button
              key={s}
              onClick={() => { setSalary(s.toString()); setPeriod("annual"); }}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                inputValue === s && period === "annual"
                  ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {country.currencySymbol}{s.toLocaleString()}
            </button>
          ))}
        </div>

        {annualGross > 0 && (
          <>
            <TaxBar brackets={result.brackets} gross={result.grossAnnual} />

            <div className="grid grid-cols-2 gap-4 mt-6">
              <ResultCard label="Gross Annual" value={fmt(result.grossAnnual, country.currencySymbol)} />
              <ResultCard label={country.taxLabels.federal} value={fmt(result.federalTax, country.currencySymbol)} negative />
              {result.socialSecurity > 0 && (
                <ResultCard label={country.taxLabels.social} value={fmt(result.socialSecurity, country.currencySymbol)} negative />
              )}
              <ResultCard label="Total Tax" value={fmt(result.totalTax, country.currencySymbol)} negative />
              <ResultCard label="Effective Tax Rate" value={`${result.effectiveRate}%`} />
              <ResultCard label="Net Annual" value={fmt(result.netAnnual, country.currencySymbol)} highlight />
              <ResultCard label="Net Monthly" value={fmt(result.netMonthly, country.currencySymbol)} highlight />
              <ResultCard label="Net Weekly" value={fmt(result.netWeekly, country.currencySymbol)} />
              <ResultCard label="Net Daily" value={fmt(result.netDaily, country.currencySymbol)} />
              <ResultCard label="Net Hourly" value={fmt(result.netHourly, country.currencySymbol)} />
            </div>

            {/* Share button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleShare}
                className="text-sm px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {copied ? "Link copied!" : "Share this calculation"}
              </button>
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
          : negative
          ? "bg-red-50/50 dark:bg-red-900/10"
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
