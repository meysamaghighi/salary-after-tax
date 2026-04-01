import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About SalaryAfterTax | Free Take-Home Pay Calculator",
  description:
    "Learn about SalaryAfterTax - a free salary calculator covering 9 countries with privacy-first design and accurate tax calculations.",
  openGraph: {
    title: "About SalaryAfterTax",
    description: "Free, privacy-first take-home pay calculator for 9 countries.",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <main className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-8"
        >
          &larr; Home
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          About SalaryAfterTax
        </h1>

        <div className="space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              What is SalaryAfterTax?
            </h2>
            <p>
              SalaryAfterTax is a free take-home pay calculator that helps you understand your real
              salary after taxes. We currently support 9 countries: United States, United Kingdom,
              Canada, Australia, Germany, India, Ireland, Sweden, and the Netherlands.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Features
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>88 static pages covering salary scenarios across 9 countries</li>
              <li>Side-by-side country comparison tool</li>
              <li>Reverse calculator to find pre-tax salary from desired take-home pay</li>
              <li>Popular salary tables for quick reference</li>
              <li>Visual tax breakdown charts</li>
              <li>Shareable calculation URLs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Privacy First
            </h2>
            <p className="mb-3">
              All calculations run locally in your browser. No data is sent to our servers. We
              don&apos;t collect personal information, and you don&apos;t need to create an account
              or download anything.
            </p>
            <p className="mb-3">
              We use Google Analytics to understand how visitors use the site (page views, traffic
              sources, etc.), but this data is anonymous and aggregated.
            </p>
            <p>
              This site may display non-intrusive ads through Google AdSense to support hosting costs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Accuracy & Data Sources
            </h2>
            <p className="mb-3">
              Our tax calculations are based on official 2025 tax brackets, social security rates,
              and standard deductions from each country&apos;s tax authority. We strive to keep the
              data up-to-date, but tax laws can change frequently.
            </p>
            <p className="font-medium text-gray-700 dark:text-gray-300">
              Important: This calculator is for estimation purposes only. Always verify with official
              sources or consult a qualified tax professional for advice specific to your situation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Built by MeyDev
            </h2>
            <p className="mb-3">
              SalaryAfterTax is built and maintained by MeyDev, an independent developer creating
              useful web tools and calculators.
            </p>
            <p className="mb-3">
              Have feedback, found a bug, or want to suggest a new country?
              <br />
              Contact us at:{" "}
              <a
                href="mailto:meydev.studio@gmail.com"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                meydev.studio@gmail.com
              </a>
            </p>
          </section>

          <section className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Disclaimer
            </h2>
            <p className="text-sm">
              The calculators and information provided on SalaryAfterTax are for informational and
              educational purposes only. They do not constitute professional tax, financial, or legal
              advice. Tax situations vary based on individual circumstances, and laws change regularly.
              Always consult with a qualified tax professional or financial advisor for advice specific
              to your situation. MeyDev and SalaryAfterTax assume no liability for any decisions made
              based on information provided by this site.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
          >
            Start calculating &rarr;
          </Link>
        </div>
      </main>

      <footer className="text-center text-sm text-gray-400 py-8 border-t border-gray-100 dark:border-gray-800">
        <p>&copy; 2025 SalaryAfterTax. For estimation purposes only.</p>
      </footer>
    </div>
  );
}
