import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { countries, countryOrder } from "../../lib/tax-engines";
import Flag from "../../components/Flag";
import TaxCalculator from "../../components/TaxCalculator";

interface Props {
  params: Promise<{ country: string; salary: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { country: string; salary: string }[] = [];
  for (const code of Object.keys(countries)) {
    for (const s of countries[code].popularSalaries) {
      params.push({ country: code, salary: s.toString() });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: code, salary: salaryStr } = await params;
  const country = countries[code];
  const salary = parseInt(salaryStr);
  if (!country || isNaN(salary) || salary <= 0) return {};

  const r = country.calculate(salary);
  const fmtNum = (n: number) => `${country.currencySymbol}${n.toLocaleString("en-US")}`;

  return {
    title: `${fmtNum(salary)} Salary After Tax in ${country.name} ${country.taxYear} | Net ${fmtNum(r.netAnnual)}`,
    description: `On a ${fmtNum(salary)} salary in ${country.name}, you take home ${fmtNum(r.netAnnual)} per year (${fmtNum(r.netMonthly)}/month) after ${fmtNum(r.totalTax)} in taxes. Effective tax rate: ${r.effectiveRate}%. ${country.taxYear} rates.`,
    keywords: [
      `${salaryStr} salary after tax ${country.name.toLowerCase()}`,
      `${fmtNum(salary)} after tax ${country.name.toLowerCase()}`,
      `${salaryStr} ${country.currency} take home pay`,
      `how much is ${fmtNum(salary)} after tax`,
      `${country.name.toLowerCase()} tax on ${fmtNum(salary)}`,
    ],
    openGraph: {
      title: `${fmtNum(salary)} After Tax in ${country.name}`,
      description: `Take home ${fmtNum(r.netAnnual)}/year (${fmtNum(r.netMonthly)}/month). Tax: ${r.effectiveRate}%.`,
    },
    alternates: {
      canonical: `/${code}/${salary}`,
    },
  };
}


function fmt(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString("en-US")}`;
}

export default async function SalaryPage({ params }: Props) {
  const { country: code, salary: salaryStr } = await params;
  const country = countries[code];
  const salary = parseInt(salaryStr);
  if (!country || isNaN(salary) || salary <= 0) notFound();

  const r = country.calculate(salary);
  const sym = country.currencySymbol;

  // Nearby salaries for internal linking
  const nearby = [
    salary - 10000, salary - 5000, salary + 5000, salary + 10000,
  ].filter((s) => s > 0);

  const otherCountries = countryOrder.filter((c) => c !== code).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <div className="flex gap-3 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">Home</Link>
          <span>/</span>
          <Link href={`/${code}`} className="hover:text-gray-700 dark:hover:text-gray-200">{country.name}</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">{fmt(salary, sym)}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-3">
          <Flag code={country.flag} size={32} className="mr-2" /> {fmt(salary, sym)} Salary After Tax in {country.name}
        </h1>

        {/* Key answer right at the top — Google featured snippet target */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center mb-8">
          <p className="text-sm text-green-700 dark:text-green-400 mb-1">Your take-home pay</p>
          <p className="text-4xl font-bold text-green-700 dark:text-green-400">
            {fmt(r.netAnnual, sym)}<span className="text-lg font-normal">/year</span>
          </p>
          <p className="text-xl text-green-600 dark:text-green-500 mt-1">
            {fmt(r.netMonthly, sym)}<span className="text-sm font-normal">/month</span>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            After {fmt(r.totalTax, sym)} in taxes ({r.effectiveRate}% effective rate)
          </p>
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />}>
          <TaxCalculator countryCode={code} />
        </Suspense>

        {/* Detailed text breakdown — SEO content */}
        <section className="mt-12 bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {fmt(salary, sym)} Salary Breakdown in {country.name} ({country.taxYear})
          </h2>
          <div className="text-gray-600 dark:text-gray-400 space-y-3 text-sm leading-relaxed">
            <p>
              If you earn {fmt(salary, sym)} per year in {country.name}, your take-home pay will
              be approximately <strong className="text-gray-900 dark:text-white">{fmt(r.netAnnual, sym)}</strong> per
              year, or <strong className="text-gray-900 dark:text-white">{fmt(r.netMonthly, sym)}</strong> per month.
            </p>
            <p>
              Your total tax obligation is {fmt(r.totalTax, sym)}, broken down
              as {fmt(r.federalTax, sym)} in {country.taxLabels.federal.toLowerCase()}
              {r.socialSecurity > 0 ? ` and ${fmt(r.socialSecurity, sym)} in ${country.taxLabels.social.toLowerCase()}` : ""}.
              This gives you an effective tax rate of {r.effectiveRate}%.
            </p>
            <p>
              On a weekly basis, you would take home {fmt(r.netWeekly, sym)}, which works out
              to {fmt(r.netDaily, sym)} per working day or {fmt(r.netHourly, sym)} per hour
              (based on a 40-hour work week).
            </p>
          </div>
        </section>

        {/* Nearby salaries — internal linking for SEO */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Similar salaries in {country.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {nearby.map((s) => {
              const nr = country.calculate(s);
              return (
                <Link
                  key={s}
                  href={`/${code}/${s}`}
                  className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors text-center"
                >
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{fmt(s, sym)}</p>
                  <p className="text-green-600 dark:text-green-400 text-xs mt-1">{fmt(nr.netMonthly, sym)}/mo</p>
                </Link>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {country.popularSalaries.filter((s) => s !== salary).map((s) => (
              <Link
                key={s}
                href={`/${code}/${s}`}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                {fmt(s, sym)}
              </Link>
            ))}
          </div>
        </section>

        {/* Same salary in other countries */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {fmt(salary, sym)} in other countries
          </h2>
          <div className="flex flex-wrap gap-3">
            {otherCountries.map((c) => {
              const other = countries[c];
              return (
                <Link
                  key={c}
                  href={`/${c}`}
                  className="px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  <Flag code={other.flag} /> {other.name}
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-gray-400 py-8 border-t border-gray-100 dark:border-gray-800 mt-16">
        <p>For estimation purposes only. Does not constitute tax advice.</p>
        <p className="mt-2">
          <Link href="/" className="hover:text-gray-600">Home</Link>
          {" "}&middot;{" "}
          <Link href={`/${code}`} className="hover:text-gray-600">{country.name} Calculator</Link>
        </p>
      </footer>

      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [{
              "@type": "Question",
              name: `How much is ${fmt(salary, sym)} after tax in ${country.name}?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `On a ${fmt(salary, sym)} salary in ${country.name} (${country.taxYear}), you take home ${fmt(r.netAnnual, sym)} per year (${fmt(r.netMonthly, sym)} per month) after ${fmt(r.totalTax, sym)} in taxes. Effective tax rate: ${r.effectiveRate}%.`,
              },
            }],
          }),
        }}
      />
    </div>
  );
}
