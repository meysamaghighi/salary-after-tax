import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { countries } from "../lib/tax-engines";
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
    description: `Free ${country.name} salary after tax calculator for ${country.taxYear}. Calculate your take-home pay, ${country.taxLabels.federal.toLowerCase()}, ${country.taxLabels.social.toLowerCase()}, and effective tax rate.`,
    keywords: [
      `${country.name.toLowerCase()} salary after tax`,
      `${country.name.toLowerCase()} tax calculator`,
      `${country.name.toLowerCase()} take home pay`,
      `${country.currency} salary calculator`,
      `${country.name.toLowerCase()} income tax ${country.taxYear}`,
    ],
    openGraph: {
      title: `${country.name} Salary After Tax Calculator`,
      description: `Calculate your ${country.name} take-home pay for ${country.taxYear}. Free and instant.`,
    },
  };
}

export default async function CountryPage({ params }: Props) {
  const { country: code } = await params;
  const country = countries[code];
  if (!country) notFound();

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
          {flagEmoji(country.flag)} {country.name} Salary After Tax
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          {country.taxYear} federal tax rates &middot; {country.currency}
        </p>

        <TaxCalculator countryCode={country.code} />
      </main>

      <footer className="text-center text-sm text-gray-400 py-8">
        For estimation purposes only. Does not include state/provincial taxes.
      </footer>
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
