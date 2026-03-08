import Link from "next/link";
import type { Metadata } from "next";
import { countries } from "./lib/tax-engines";

export const metadata: Metadata = {
  title: "Salary After Tax Calculator | US, UK, Canada",
  description:
    "Free salary after tax calculator. See your take-home pay instantly for the US, UK, and Canada. Federal tax breakdown, effective tax rate, and monthly net pay.",
  keywords: [
    "salary after tax",
    "take home pay calculator",
    "tax calculator",
    "salary calculator",
    "net pay",
    "income tax calculator",
  ],
  openGraph: {
    title: "Salary After Tax Calculator",
    description: "See your take-home pay instantly. Free tax calculator for US, UK, and Canada.",
    type: "website",
  },
};

export default function Home() {
  const countryList = Object.values(countries);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Salary After Tax
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-12 max-w-xl mx-auto">
          Find out your take-home pay after taxes. Select your country to get started.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          {countryList.map((c) => (
            <Link
              key={c.code}
              href={`/${c.code}`}
              className="group flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-800"
            >
              <span className="text-4xl">{flagEmoji(c.flag)}</span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {c.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {c.currency} &middot; {c.taxYear}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            How it works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3 text-left">
            <Step n={1} title="Enter salary" desc="Type your gross annual or monthly salary." />
            <Step n={2} title="See breakdown" desc="Instant tax calculation with visual breakdown." />
            <Step n={3} title="Plan ahead" desc="Know your real take-home pay for budgeting." />
          </div>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-8">
        For estimation purposes only. Does not include state/provincial taxes.
      </footer>
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

function flagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 0x1f1e6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
}
