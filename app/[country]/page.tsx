import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { countries, countryOrder } from "../lib/tax-engines";
import TaxCalculator from "../components/TaxCalculator";

interface Props {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  return Object.keys(countries).map((code) => ({ country: code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: code } = await params;
  const country = countries[code];
  if (!country) return {};

  return {
    title: `${country.name} Salary After Tax Calculator ${country.taxYear} | Take-Home Pay`,
    description: country.seoDescription,
    keywords: [
      `${country.name.toLowerCase()} salary after tax`,
      `${country.name.toLowerCase()} tax calculator`,
      `${country.name.toLowerCase()} take home pay`,
      `${country.name.toLowerCase()} net salary calculator`,
      `${country.currency} salary calculator`,
      `${country.name.toLowerCase()} income tax ${country.taxYear}`,
      `how much tax do i pay ${country.name.toLowerCase()}`,
      `${country.name.toLowerCase()} salary calculator after deductions`,
    ],
    openGraph: {
      title: `${country.name} Salary After Tax Calculator ${country.taxYear}`,
      description: country.seoDescription,
    },
  };
}

function flagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}

function fmt(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

export default async function CountryPage({ params }: Props) {
  const { country: code } = await params;
  const country = countries[code];
  if (!country) notFound();

  // Pre-calculate popular salary table
  const salaryTable = country.popularSalaries.map((s) => {
    const r = country.calculate(s);
    return { gross: s, tax: r.totalTax, net: r.netAnnual, monthly: r.netMonthly, rate: r.effectiveRate };
  });

  // Other countries for cross-linking
  const otherCountries = countryOrder.filter((c) => c !== code).slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-8"
        >
          &larr; All countries
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {flagEmoji(country.flag)} {country.name} Salary After Tax Calculator
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          {country.taxYear} tax rates &middot; {country.currency}
        </p>

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />}>
          <TaxCalculator countryCode={country.code} />
        </Suspense>

        {/* Popular salaries table — great for SEO long-tail keywords */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {country.name} Salary After Tax Table ({country.taxYear})
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Quick reference: see the take-home pay for common salaries in {country.name}.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Gross Annual</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Total Tax</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Net Annual</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Net Monthly</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Tax Rate</th>
                </tr>
              </thead>
              <tbody>
                {salaryTable.map((row) => (
                  <tr key={row.gross} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="py-3 px-2 font-medium">{fmt(row.gross, country.currencySymbol)}</td>
                    <td className="py-3 px-2 text-red-600 dark:text-red-400">{fmt(row.tax, country.currencySymbol)}</td>
                    <td className="py-3 px-2 text-green-700 dark:text-green-400 font-medium">{fmt(row.net, country.currencySymbol)}</td>
                    <td className="py-3 px-2 text-green-700 dark:text-green-400">{fmt(row.monthly, country.currencySymbol)}</td>
                    <td className="py-3 px-2">{row.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEO content */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How {country.name} Income Tax Works
          </h2>
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
            <p>{country.seoDescription}</p>
            <p>
              This calculator provides an estimate of your take-home pay based on {country.taxYear} federal tax
              rates. Your actual take-home pay may differ based on state/provincial taxes, additional deductions,
              tax credits, filing status, and other factors specific to your situation.
            </p>
            <p>
              Use the calculator above to enter your exact salary and see a detailed breakdown including
              weekly, daily, and hourly net pay rates.
            </p>
          </div>
        </section>

        {/* Cross-linking to other countries */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Compare with other countries
          </h2>
          <div className="flex flex-wrap gap-3">
            {otherCountries.map((c) => {
              const other = countries[c];
              return (
                <Link
                  key={c}
                  href={`/${c}`}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {flagEmoji(other.flag)} {other.name}
                </Link>
              );
            })}
            <Link
              href="/"
              className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              All countries &rarr;
            </Link>
          </div>
        </section>

        {/* FAQ — structured data for Google rich snippets */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FAQ
              q={`How much tax do I pay on ${fmt(country.defaultSalary, country.currencySymbol)} in ${country.name}?`}
              a={(() => {
                const r = country.calculate(country.defaultSalary);
                return `On a ${fmt(country.defaultSalary, country.currencySymbol)} salary in ${country.name}, you would pay approximately ${fmt(r.totalTax, country.currencySymbol)} in taxes (${r.effectiveRate}% effective rate), leaving you with ${fmt(r.netAnnual, country.currencySymbol)} per year or ${fmt(r.netMonthly, country.currencySymbol)} per month.`;
              })()}
            />
            <FAQ
              q={`What is the effective tax rate in ${country.name}?`}
              a={`The effective tax rate in ${country.name} depends on your income level. Due to progressive taxation, higher earners pay a higher percentage. For example, a ${fmt(country.popularSalaries[1], country.currencySymbol)} salary has an effective rate of ${country.calculate(country.popularSalaries[1]).effectiveRate}%, while a ${fmt(country.popularSalaries[5], country.currencySymbol)} salary has a rate of ${country.calculate(country.popularSalaries[5]).effectiveRate}%.`}
            />
            <FAQ
              q="Does this calculator include state or provincial taxes?"
              a="No, this calculator shows federal/national taxes only. State, provincial, or local taxes will further reduce your take-home pay. The actual difference depends on where you live."
            />
            <FAQ
              q="How accurate is this calculator?"
              a={`This calculator uses official ${country.taxYear} tax rates and provides a good estimate for most employees. However, it assumes single/standard filing status and doesn't account for special deductions, credits, or circumstances. Always consult a tax professional for precise calculations.`}
            />
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 py-8 border-t border-gray-100 dark:border-gray-800 mt-16">
        <p>For estimation purposes only. Does not constitute tax advice.</p>
        <p className="mt-2">
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300">Salary After Tax Calculator</Link>
          {" "}&middot;{" "}
          {otherCountries.slice(0, 3).map((c) => (
            <span key={c}>
              <Link href={`/${c}`} className="hover:text-gray-600 dark:hover:text-gray-300">
                {countries[c].name}
              </Link>
              {" "}&middot;{" "}
            </span>
          ))}
          <Link href="/" className="hover:text-gray-600 dark:hover:text-gray-300">More countries</Link>
        </p>
      </footer>

      {/* FAQ structured data for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: `How much tax do I pay on ${fmt(country.defaultSalary, country.currencySymbol)} in ${country.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: (() => {
                    const r = country.calculate(country.defaultSalary);
                    return `On a ${fmt(country.defaultSalary, country.currencySymbol)} salary in ${country.name}, you would pay approximately ${fmt(r.totalTax, country.currencySymbol)} in taxes (${r.effectiveRate}% effective rate), leaving you with ${fmt(r.netAnnual, country.currencySymbol)} per year.`;
                  })(),
                },
              },
              {
                "@type": "Question",
                name: `What is the effective tax rate in ${country.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `The effective tax rate depends on income level. A ${fmt(country.popularSalaries[1], country.currencySymbol)} salary has a ${country.calculate(country.popularSalaries[1]).effectiveRate}% rate, while ${fmt(country.popularSalaries[5], country.currencySymbol)} has a ${country.calculate(country.popularSalaries[5]).effectiveRate}% rate.`,
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-gray-200 dark:border-gray-700 rounded-xl">
      <summary className="flex justify-between items-center cursor-pointer p-4 font-medium text-gray-900 dark:text-white">
        {q}
        <span className="ml-2 text-gray-400 group-open:rotate-180 transition-transform">&#9662;</span>
      </summary>
      <p className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
    </details>
  );
}
