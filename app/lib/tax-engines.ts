export interface TaxBreakdown {
  grossAnnual: number;
  federalTax: number;
  stateTax: number; // or regional equivalent
  socialSecurity: number; // NI, CPP, FICA, etc.
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRate: number;
  brackets: { label: string; amount: number; color: string }[];
}

// ============ US (2025 Federal) ============
// Standard deduction: $15,000 (single)
// FICA: Social Security 6.2% (up to $176,100) + Medicare 1.45% (+ 0.9% over $200k)
const US_BRACKETS = [
  { min: 0, max: 11925, rate: 0.10 },
  { min: 11925, max: 48475, rate: 0.12 },
  { min: 48475, max: 103350, rate: 0.22 },
  { min: 103350, max: 197300, rate: 0.24 },
  { min: 197300, max: 250525, rate: 0.32 },
  { min: 250525, max: 626350, rate: 0.35 },
  { min: 626350, max: Infinity, rate: 0.37 },
];

export function calculateUS(gross: number): TaxBreakdown {
  const standardDeduction = 15000;
  const taxableIncome = Math.max(0, gross - standardDeduction);

  let federalTax = 0;
  for (const bracket of US_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxable = Math.min(taxableIncome, bracket.max) - bracket.min;
      federalTax += taxable * bracket.rate;
    }
  }

  // FICA
  const ssCap = 176100;
  const socialSecurityTax = Math.min(gross, ssCap) * 0.062;
  const medicareTax = gross * 0.0145 + Math.max(0, gross - 200000) * 0.009;
  const fica = socialSecurityTax + medicareTax;

  const totalTax = federalTax + fica;
  const netAnnual = gross - totalTax;

  return {
    grossAnnual: gross,
    federalTax: Math.round(federalTax),
    stateTax: 0,
    socialSecurity: Math.round(fica),
    totalTax: Math.round(totalTax),
    netAnnual: Math.round(netAnnual),
    netMonthly: Math.round(netAnnual / 12),
    effectiveRate: gross > 0 ? Math.round((totalTax / gross) * 1000) / 10 : 0,
    brackets: [
      { label: "Federal Tax", amount: Math.round(federalTax), color: "#ef4444" },
      { label: "FICA (SS + Medicare)", amount: Math.round(fica), color: "#f97316" },
      { label: "Take-Home Pay", amount: Math.round(netAnnual), color: "#22c55e" },
    ],
  };
}

// ============ UK (2025/26) ============
// Personal allowance: 12,570 (tapers above 100k)
// NI: 8% on 12,570-50,270, 2% above
const UK_BRACKETS = [
  { min: 0, max: 37700, rate: 0.20 },
  { min: 37700, max: 125140, rate: 0.40 },
  { min: 125140, max: Infinity, rate: 0.45 },
];

export function calculateUK(gross: number): TaxBreakdown {
  let personalAllowance = 12570;
  // Taper: lose 1 for every 2 over 100k
  if (gross > 100000) {
    personalAllowance = Math.max(0, personalAllowance - Math.floor((gross - 100000) / 2));
  }
  const taxableIncome = Math.max(0, gross - personalAllowance);

  let incomeTax = 0;
  for (const bracket of UK_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxable = Math.min(taxableIncome, bracket.max) - bracket.min;
      incomeTax += taxable * bracket.rate;
    }
  }

  // National Insurance
  let ni = 0;
  if (gross > 12570) {
    ni += Math.min(gross, 50270) > 12570
      ? (Math.min(gross, 50270) - 12570) * 0.08
      : 0;
    if (gross > 50270) {
      ni += (gross - 50270) * 0.02;
    }
  }

  const totalTax = incomeTax + ni;
  const netAnnual = gross - totalTax;

  return {
    grossAnnual: gross,
    federalTax: Math.round(incomeTax),
    stateTax: 0,
    socialSecurity: Math.round(ni),
    totalTax: Math.round(totalTax),
    netAnnual: Math.round(netAnnual),
    netMonthly: Math.round(netAnnual / 12),
    effectiveRate: gross > 0 ? Math.round((totalTax / gross) * 1000) / 10 : 0,
    brackets: [
      { label: "Income Tax", amount: Math.round(incomeTax), color: "#ef4444" },
      { label: "National Insurance", amount: Math.round(ni), color: "#f97316" },
      { label: "Take-Home Pay", amount: Math.round(netAnnual), color: "#22c55e" },
    ],
  };
}

// ============ Canada (2025 Federal) ============
// Basic personal amount: $16,129
// CPP: 5.95% on $3,500-$71,300 (CPP1) + 4% on $71,300-$81,200 (CPP2)
// EI: 1.64% up to $65,700
const CA_BRACKETS = [
  { min: 0, max: 57375, rate: 0.15 },
  { min: 57375, max: 114750, rate: 0.205 },
  { min: 114750, max: 158468, rate: 0.26 },
  { min: 158468, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
];

export function calculateCA(gross: number): TaxBreakdown {
  const basicPersonalAmount = 16129;
  const taxableIncome = Math.max(0, gross - basicPersonalAmount);

  let federalTax = 0;
  for (const bracket of CA_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxable = Math.min(taxableIncome, bracket.max) - bracket.min;
      federalTax += taxable * bracket.rate;
    }
  }

  // CPP
  const cpp1Max = 71300;
  const cpp2Max = 81200;
  const cppExemption = 3500;
  let cpp = 0;
  if (gross > cppExemption) {
    cpp += (Math.min(gross, cpp1Max) - cppExemption) * 0.0595;
    if (gross > cpp1Max) {
      cpp += (Math.min(gross, cpp2Max) - cpp1Max) * 0.04;
    }
  }

  // EI
  const eiMax = 65700;
  const ei = Math.min(gross, eiMax) * 0.0164;

  const deductions = cpp + ei;
  const totalTax = federalTax + deductions;
  const netAnnual = gross - totalTax;

  return {
    grossAnnual: gross,
    federalTax: Math.round(federalTax),
    stateTax: 0,
    socialSecurity: Math.round(deductions),
    totalTax: Math.round(totalTax),
    netAnnual: Math.round(netAnnual),
    netMonthly: Math.round(netAnnual / 12),
    effectiveRate: gross > 0 ? Math.round((totalTax / gross) * 1000) / 10 : 0,
    brackets: [
      { label: "Federal Tax", amount: Math.round(federalTax), color: "#ef4444" },
      { label: "CPP + EI", amount: Math.round(deductions), color: "#f97316" },
      { label: "Take-Home Pay", amount: Math.round(netAnnual), color: "#22c55e" },
    ],
  };
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  currencySymbol: string;
  flag: string;
  taxYear: string;
  calculate: (gross: number) => TaxBreakdown;
  taxLabels: { federal: string; social: string };
  defaultSalary: number;
}

export const countries: Record<string, CountryConfig> = {
  us: {
    code: "us",
    name: "United States",
    currency: "USD",
    currencySymbol: "$",
    flag: "US",
    taxYear: "2025",
    calculate: calculateUS,
    taxLabels: { federal: "Federal Income Tax", social: "FICA (SS + Medicare)" },
    defaultSalary: 75000,
  },
  uk: {
    code: "uk",
    name: "United Kingdom",
    currency: "GBP",
    currencySymbol: "\u00A3",
    flag: "GB",
    taxYear: "2025/26",
    calculate: calculateUK,
    taxLabels: { federal: "Income Tax", social: "National Insurance" },
    defaultSalary: 35000,
  },
  ca: {
    code: "ca",
    name: "Canada",
    currency: "CAD",
    currencySymbol: "C$",
    flag: "CA",
    taxYear: "2025",
    calculate: calculateCA,
    taxLabels: { federal: "Federal Income Tax", social: "CPP + EI" },
    defaultSalary: 65000,
  },
};
