import Link from "next/link";
import type { Metadata } from "next";
import { countries, countryOrder } from "./lib/tax-engines";

export const metadata: Metadata = {
  title: "Salary After Tax Calculator 2025 | Free Take-Home Pay Calculator",
  description:
    "Free salary after tax calculator for 9 countries: US, UK, Canada, Australia, Germany, India, Ireland, Sweden, Netherlands. See your take-home pay instantly with tax breakdown, effective rate, and monthly net pay.",
  keywords: [
    "salary after tax",
    "take home pay calculator",
    "tax calculator",
    "salary calculator",
    "net pay calculator",
    "income tax calculator",
    "salary after tax US",
    "salary after tax UK",
    "salary calculator Canada",
    "salary calculator Australia",
    "Germany net salary",
    "India salary calculator",
    "after tax income",
    "how much tax do I pay",
  ],
  openGraph: {
    title: "Salary After Tax Calculator 2025",
    description: "Free take-home pay calculator for 9 countries. Instant tax breakdown.",
    type: "website",
  },
};

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

export default function Home() {
  const countryList = countryOrder.map((code) => countries[code]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Salary After Tax Calculator
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          Find out your real take-home pay. Free tax calculator for 9 countries with instant breakdown.
        </p>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          {countryList.map((c) => {
            const r = c.calculate(c.defaultSalary);
            return (
              <Link
                key={c.code}
                href={`/${c.code}`}
                className="group flex flex-col items-center gap-2 p-5 sm:p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-800"
              >
                <span className="text-3xl sm:text-4xl">{flagEmoji(c.flag)}</span>
                <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {c.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {c.currency} &middot; {c.taxYear}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {fmt(c.defaultSalary, c.currencySymbol)} &rarr;{" "}
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {fmt(r.netMonthly, c.currencySymbol)}/mo
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/compare"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
          >
            Compare countries side by side &rarr;
          </Link>
        </div>

        {/* How it works */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            How it works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3 text-left">
            <Step n={1} title="Pick your country" desc="We support 9 countries with accurate 2025 tax brackets." />
            <Step n={2} title="Enter your salary" desc="Annual or monthly. See instant tax breakdown with visual chart." />
            <Step n={3} title="Plan your finances" desc="Get monthly, weekly, daily, and hourly take-home pay." />
          </div>
        </section>

        {/* Quick comparison table — SEO goldmine */}
        <section className="mt-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Tax comparison across countries
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            How much would you take home on a typical salary in each country?
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Country</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Typical Salary</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Take-Home</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Tax Rate</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {countryList.map((c) => {
                  const r = c.calculate(c.defaultSalary);
                  return (
                    <tr key={c.code} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="py-3 px-2 font-medium">
                        {flagEmoji(c.flag)} {c.name}
                      </td>
                      <td className="py-3 px-2">{fmt(c.defaultSalary, c.currencySymbol)}</td>
                      <td className="py-3 px-2 text-green-700 dark:text-green-400 font-medium">{fmt(r.netAnnual, c.currencySymbol)}</td>
                      <td className="py-3 px-2">{r.effectiveRate}%</td>
                      <td className="py-3 px-2">
                        <Link href={`/${c.code}`} className="text-blue-600 dark:text-blue-400 hover:underline text-xs">
                          Calculate &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* SEO content block */}
        <section className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            About this calculator
          </h2>
          <div className="text-gray-600 dark:text-gray-400 space-y-4 text-sm leading-relaxed">
            <p>
              Our salary after tax calculator helps you understand your real take-home pay.
              Whether you&apos;re evaluating a job offer, planning a move abroad, or just curious about
              how much of your salary goes to taxes, this tool gives you an instant breakdown.
            </p>
            <p>
              We currently support 9 countries: United States, United Kingdom, Canada, Australia,
              Germany, India, Ireland, Sweden, and the Netherlands. All calculations use official
              2025 tax brackets and include major deductions like social security contributions,
              national insurance, and pension contributions.
            </p>
            <p>
              Each country page includes a detailed salary table, FAQ section, and the ability to
              share your calculation with others via a unique URL. Enter your salary to get started.
            </p>
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 py-8 border-t border-gray-100 dark:border-gray-800">
        <p>For estimation purposes only. Does not constitute tax advice.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {countryList.map((c) => (
            <Link
              key={c.code}
              href={`/${c.code}`}
              className="hover:text-gray-600 dark:hover:text-gray-300"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </footer>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Salary After Tax Calculator",
            description: "Free salary after tax calculator for 9 countries. See your take-home pay instantly.",
            url: "https://salary-after-tax.vercel.app",
            applicationCategory: "FinanceApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
          }),
        }}
      />
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <div className="p-4">
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm mb-2">
        {n}
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
    </div>
  );
}
