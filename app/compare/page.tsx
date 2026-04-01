import type { Metadata } from "next";
import Link from "next/link";
import { countries, countryOrder } from "../lib/tax-engines";
import CompareCalculator from "../components/CompareCalculator";
import Flag from "../components/Flag";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Compare Salary After Tax Between Countries | CashCalcs",
  description:
    "Compare take-home pay between countries side by side. See how taxes differ across the US, UK, Canada, Australia, and more.",
  keywords: [
    "compare tax between countries",
    "salary comparison countries",
    "tax rate comparison",
    "us vs uk tax",
    "take home pay comparison",
    "which country has lowest tax",
    "compare income tax",
  ],
  openGraph: {
    title: "Compare Salary After Tax Between Countries",
    description: "Free side-by-side salary comparison across 9 countries.",
    type: "website",
  },
};


function fmt(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-8"
        >
          &larr; Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-3">
          Compare Salary After Tax
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
          Pick two countries and a salary to see how your take-home pay compares.
        </p>

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />}>
          <CompareCalculator />
        </Suspense>

        {/* Pre-rendered comparison table for SEO */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tax rates at a glance (on $50,000 equivalent)
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Effective tax rates on a typical middle-income salary in each country (using default salary for each).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Country</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Typical Salary</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Total Tax</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Take-Home</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Rate</th>
                </tr>
              </thead>
              <tbody>
                {countryOrder.map((code) => {
                  const c = countries[code];
                  const r = c.calculate(c.defaultSalary);
                  return (
                    <tr key={code} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-2 font-medium">
                        <Link href={`/${code}`} className="hover:text-blue-600">
                          <Flag code={c.flag} /> {c.name}
                        </Link>
                      </td>
                      <td className="py-3 px-2">{fmt(c.defaultSalary, c.currencySymbol)}</td>
                      <td className="py-3 px-2 text-red-600 dark:text-red-400">{fmt(r.totalTax, c.currencySymbol)}</td>
                      <td className="py-3 px-2 text-green-700 dark:text-green-400 font-medium">{fmt(r.netAnnual, c.currencySymbol)}</td>
                      <td className="py-3 px-2">{r.effectiveRate}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Why compare taxes between countries?
          </h2>
          <div className="text-gray-600 dark:text-gray-400 space-y-3 text-sm leading-relaxed">
            <p>
              If you&apos;re considering a job abroad, negotiating a relocation package, or simply curious
              about how tax systems compare, this tool helps you understand the real difference in
              take-home pay between countries.
            </p>
            <p>
              Keep in mind that tax rates are just one factor. Cost of living, healthcare,
              public services, and quality of life all vary significantly between countries.
              A lower tax rate doesn&apos;t always mean more purchasing power.
            </p>
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 py-8 border-t border-gray-100 dark:border-gray-800 mt-16">
        <p>For estimation purposes only.</p>
        <div className="mt-3">
          <Link
            href="/about"
            className="hover:text-gray-600 dark:hover:text-gray-300"
          >
            About
          </Link>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Salary Tax Comparison Tool",
            description: "Compare take-home pay and tax rates between 9 countries side by side.",
            url: "https://salaryaftertax.net/compare",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />
    </div>
  );
}
