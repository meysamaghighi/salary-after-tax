export interface TaxBreakdown {
  grossAnnual: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  netWeekly: number;
  netDaily: number;
  netHourly: number;
  effectiveRate: number;
  brackets: { label: string; amount: number; color: string }[];
}

function buildResult(
  gross: number,
  federalTax: number,
  socialSecurity: number,
  federalLabel: string,
  socialLabel: string,
): TaxBreakdown {
  const totalTax = federalTax + socialSecurity;
  const netAnnual = gross - totalTax;
  return {
    grossAnnual: gross,
    federalTax: Math.round(federalTax),
    stateTax: 0,
    socialSecurity: Math.round(socialSecurity),
    totalTax: Math.round(totalTax),
    netAnnual: Math.round(netAnnual),
    netMonthly: Math.round(netAnnual / 12),
    netWeekly: Math.round(netAnnual / 52),
    netDaily: Math.round(netAnnual / 260),
    netHourly: Math.round(netAnnual / 2080),
    effectiveRate: gross > 0 ? Math.round((totalTax / gross) * 1000) / 10 : 0,
    brackets: [
      { label: federalLabel, amount: Math.round(federalTax), color: "#ef4444" },
      { label: socialLabel, amount: Math.round(socialSecurity), color: "#f97316" },
      { label: "Take-Home Pay", amount: Math.round(netAnnual), color: "#22c55e" },
    ],
  };
}

function calcBrackets(taxableIncome: number, brackets: { min: number; max: number; rate: number }[]): number {
  let tax = 0;
  for (const b of brackets) {
    if (taxableIncome > b.min) {
      tax += (Math.min(taxableIncome, b.max) - b.min) * b.rate;
    }
  }
  return tax;
}

// ============ US (2025 Federal) ============
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
  const taxableIncome = Math.max(0, gross - 15000);
  const federalTax = calcBrackets(taxableIncome, US_BRACKETS);
  const fica = Math.min(gross, 176100) * 0.062 + gross * 0.0145 + Math.max(0, gross - 200000) * 0.009;
  return buildResult(gross, federalTax, fica, "Federal Tax", "FICA (SS + Medicare)");
}

// ============ UK (2025/26) ============
const UK_BRACKETS = [
  { min: 0, max: 37700, rate: 0.20 },
  { min: 37700, max: 125140, rate: 0.40 },
  { min: 125140, max: Infinity, rate: 0.45 },
];

export function calculateUK(gross: number): TaxBreakdown {
  let pa = 12570;
  if (gross > 100000) pa = Math.max(0, pa - Math.floor((gross - 100000) / 2));
  const taxableIncome = Math.max(0, gross - pa);
  const incomeTax = calcBrackets(taxableIncome, UK_BRACKETS);
  let ni = 0;
  if (gross > 12570) {
    ni += (Math.min(gross, 50270) - 12570) * 0.08;
    if (gross > 50270) ni += (gross - 50270) * 0.02;
  }
  return buildResult(gross, incomeTax, ni, "Income Tax", "National Insurance");
}

// ============ Canada (2025 Federal) ============
const CA_BRACKETS = [
  { min: 0, max: 57375, rate: 0.15 },
  { min: 57375, max: 114750, rate: 0.205 },
  { min: 114750, max: 158468, rate: 0.26 },
  { min: 158468, max: 220000, rate: 0.29 },
  { min: 220000, max: Infinity, rate: 0.33 },
];

export function calculateCA(gross: number): TaxBreakdown {
  const taxableIncome = Math.max(0, gross - 16129);
  const federalTax = calcBrackets(taxableIncome, CA_BRACKETS);
  let cpp = 0;
  if (gross > 3500) {
    cpp = (Math.min(gross, 71300) - 3500) * 0.0595;
    if (gross > 71300) cpp += (Math.min(gross, 81200) - 71300) * 0.04;
  }
  const ei = Math.min(gross, 65700) * 0.0164;
  return buildResult(gross, federalTax, cpp + ei, "Federal Income Tax", "CPP + EI");
}

// ============ Australia (2024-25) ============
const AU_BRACKETS = [
  { min: 0, max: 18200, rate: 0 },
  { min: 18200, max: 45000, rate: 0.16 },
  { min: 45000, max: 135000, rate: 0.30 },
  { min: 135000, max: 190000, rate: 0.37 },
  { min: 190000, max: Infinity, rate: 0.45 },
];

export function calculateAU(gross: number): TaxBreakdown {
  const incomeTax = calcBrackets(gross, AU_BRACKETS);
  // Medicare levy 2%
  const medicare = gross * 0.02;
  return buildResult(gross, incomeTax, medicare, "Income Tax", "Medicare Levy");
}

// ============ Germany (2025) ============
// Simplified German tax: progressive formula zones
export function calculateDE(gross: number): TaxBreakdown {
  // Grundfreibetrag (basic allowance) 2025: 12,096
  // Social contributions: ~20% employee share (pension 9.3%, health 7.3%, unemployment 1.3%, care 1.7%)
  const socialRate = 0.197;
  const socialCap = 96600; // Beitragsbemessungsgrenze (approx)
  const socialContrib = Math.min(gross, socialCap) * socialRate;

  const taxableIncome = Math.max(0, gross - socialContrib);
  let incomeTax = 0;

  if (taxableIncome <= 12096) {
    incomeTax = 0;
  } else if (taxableIncome <= 17443) {
    const y = (taxableIncome - 12096) / 10000;
    incomeTax = (932.30 * y + 1400) * y;
  } else if (taxableIncome <= 68480) {
    const z = (taxableIncome - 17443) / 10000;
    incomeTax = (176.64 * z + 2397) * z + 1015.13;
  } else if (taxableIncome <= 277826) {
    incomeTax = 0.42 * taxableIncome - 10636.31;
  } else {
    incomeTax = 0.45 * taxableIncome - 18971.10;
  }

  // Solidaritätszuschlag (5.5% of income tax, only if tax > 18,130)
  if (incomeTax > 18130) {
    incomeTax *= 1.055;
  }

  return buildResult(gross, Math.max(0, incomeTax), socialContrib, "Income Tax + Soli", "Social Contributions");
}

// ============ India (2025-26, New Tax Regime) ============
const IN_BRACKETS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.10 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.20 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.30 },
];

export function calculateIN(gross: number): TaxBreakdown {
  // Standard deduction: 75,000
  const taxableIncome = Math.max(0, gross - 75000);
  let incomeTax = calcBrackets(taxableIncome, IN_BRACKETS);
  // Rebate u/s 87A: no tax if taxable income <= 12,00,000 (new regime 2025)
  if (taxableIncome <= 1200000) incomeTax = 0;
  // Health & Education Cess: 4%
  const cess = incomeTax * 0.04;
  // EPF employee contribution: 12% of basic (assume basic = 50% of gross, capped)
  const epf = Math.min(gross * 0.5, 15000 * 12) * 0.12;
  return buildResult(gross, incomeTax + cess, epf, "Income Tax + Cess", "EPF Contribution");
}

// ============ Ireland (2025) ============
export function calculateIE(gross: number): TaxBreakdown {
  // Single person: 20% up to 44,000, 40% above
  // Tax credits: personal 1,875 + PAYE 1,875 = 3,750
  let incomeTax = 0;
  if (gross > 44000) {
    incomeTax = 44000 * 0.20 + (gross - 44000) * 0.40;
  } else {
    incomeTax = gross * 0.20;
  }
  incomeTax = Math.max(0, incomeTax - 3750);

  // USC (Universal Social Charge)
  let usc = 0;
  if (gross > 13000) {
    usc += Math.min(gross, 12012) * 0.005;
    if (gross > 12012) usc += (Math.min(gross, 25760) - 12012) * 0.02;
    if (gross > 25760) usc += (Math.min(gross, 70044) - 25760) * 0.04;
    if (gross > 70044) usc += (gross - 70044) * 0.08;
  }

  // PRSI: 4% (employee)
  const prsi = gross > 18304 ? gross * 0.04 : 0;

  return buildResult(gross, incomeTax, usc + prsi, "Income Tax", "USC + PRSI");
}

// ============ Sweden (2025) ============
export function calculateSE(gross: number): TaxBreakdown {
  // Municipal tax: ~32.4% average
  // Basic allowance: ~16,800 - 39,900 depending on income
  // State tax: 20% above 615,300 SEK
  const municipalRate = 0.3240;

  // Simplified basic allowance
  let basicAllowance = 16800;
  if (gross <= 46200) {
    basicAllowance = 16800 + (gross - 16800) * 0.347;
  } else if (gross <= 144700) {
    basicAllowance = 39900;
  } else if (gross <= 615300) {
    basicAllowance = 39900 - (gross - 144700) * 0.05;
    basicAllowance = Math.max(basicAllowance, 16800);
  } else {
    basicAllowance = 16800;
  }

  const taxableIncome = Math.max(0, gross - basicAllowance);
  const municipalTax = taxableIncome * municipalRate;

  // State income tax: 20% on income above 615,300
  const stateTax = Math.max(0, taxableIncome - 615300) * 0.20;

  const totalIncomeTax = municipalTax + stateTax;

  // Social contributions are paid by employer in Sweden, not deducted from salary
  // But pension contribution (tjänstepension) ~4.5% is common
  const pension = gross * 0.045;

  return buildResult(gross, totalIncomeTax, pension, "Municipal + State Tax", "Pension (tjänstepension)");
}

// ============ Netherlands (2025) ============
const NL_BRACKETS = [
  { min: 0, max: 38441, rate: 0.3597 },
  { min: 38441, max: 76817, rate: 0.3697 },
  { min: 76817, max: Infinity, rate: 0.495 },
];

export function calculateNL(gross: number): TaxBreakdown {
  const incomeTax = calcBrackets(gross, NL_BRACKETS);

  // General tax credit (arbeidskorting + algemene heffingskorting) simplified
  // Algemene heffingskorting: ~3,362 (phases out above 24,813)
  let ahk = 3362;
  if (gross > 24813) {
    ahk = Math.max(0, 3362 - (gross - 24813) * 0.06629);
  }
  // Arbeidskorting: ~5,532 max (phases out above 39,958)
  let ak = 0;
  if (gross <= 11491) {
    ak = gross * 0.08425;
  } else if (gross <= 24821) {
    ak = 968 + (gross - 11491) * 0.31433;
  } else if (gross <= 39958) {
    ak = 5158 + (gross - 24821) * 0.02471;
  } else if (gross <= 124935) {
    ak = 5532 - (gross - 39958) * 0.06510;
  } else {
    ak = 0;
  }

  const effectiveTax = Math.max(0, incomeTax - ahk - ak);

  // Social contributions are included in the tax brackets for NL
  return buildResult(gross, effectiveTax, 0, "Income Tax (incl. social premiums)", "Additional Deductions");
}

// ============ Country configs ============

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
  popularSalaries: number[];
  seoDescription: string;
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
    popularSalaries: [40000, 50000, 60000, 75000, 85000, 100000, 120000, 150000],
    seoDescription: "Calculate your US take-home pay for 2025. Includes federal income tax brackets, Social Security (6.2%), Medicare (1.45%), and standard deduction ($15,000). Find out what you actually earn after taxes.",
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
    popularSalaries: [25000, 30000, 35000, 40000, 50000, 60000, 80000, 100000],
    seoDescription: "Calculate your UK take-home pay for 2025/26. Includes income tax (20%/40%/45%), National Insurance contributions, and personal allowance (\u00A312,570). See your real monthly pay after deductions.",
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
    popularSalaries: [40000, 50000, 60000, 75000, 85000, 100000, 120000, 150000],
    seoDescription: "Calculate your Canadian take-home pay for 2025. Includes federal income tax, CPP contributions, and EI premiums. Federal rates only \u2014 provincial taxes vary.",
  },
  au: {
    code: "au",
    name: "Australia",
    currency: "AUD",
    currencySymbol: "A$",
    flag: "AU",
    taxYear: "2024-25",
    calculate: calculateAU,
    taxLabels: { federal: "Income Tax", social: "Medicare Levy" },
    defaultSalary: 85000,
    popularSalaries: [50000, 60000, 75000, 85000, 100000, 120000, 150000, 200000],
    seoDescription: "Calculate your Australian take-home pay for 2024-25. Includes income tax brackets, Medicare levy (2%), and tax-free threshold ($18,200). See your fortnightly and monthly net pay.",
  },
  de: {
    code: "de",
    name: "Germany",
    currency: "EUR",
    currencySymbol: "\u20AC",
    flag: "DE",
    taxYear: "2025",
    calculate: calculateDE,
    taxLabels: { federal: "Income Tax + Soli", social: "Social Contributions" },
    defaultSalary: 55000,
    popularSalaries: [30000, 40000, 50000, 55000, 65000, 80000, 100000, 120000],
    seoDescription: "Calculate your German net salary for 2025. Includes income tax, Solidarit\u00E4tszuschlag, and social contributions (pension, health, unemployment, care insurance). See what lands in your bank account.",
  },
  in: {
    code: "in",
    name: "India",
    currency: "INR",
    currencySymbol: "\u20B9",
    flag: "IN",
    taxYear: "2025-26",
    calculate: calculateIN,
    taxLabels: { federal: "Income Tax + Cess", social: "EPF Contribution" },
    defaultSalary: 1200000,
    popularSalaries: [500000, 800000, 1000000, 1200000, 1500000, 2000000, 2500000, 3000000],
    seoDescription: "Calculate your Indian take-home salary for 2025-26 under the new tax regime. Includes income tax slabs, 4% health & education cess, EPF deduction, and Section 87A rebate up to \u20B912 lakh.",
  },
  ie: {
    code: "ie",
    name: "Ireland",
    currency: "EUR",
    currencySymbol: "\u20AC",
    flag: "IE",
    taxYear: "2025",
    calculate: calculateIE,
    taxLabels: { federal: "Income Tax", social: "USC + PRSI" },
    defaultSalary: 45000,
    popularSalaries: [30000, 35000, 40000, 50000, 60000, 75000, 100000, 120000],
    seoDescription: "Calculate your Irish take-home pay for 2025. Includes income tax (20%/40%), Universal Social Charge (USC), PRSI, and tax credits. Single person rates.",
  },
  se: {
    code: "se",
    name: "Sweden",
    currency: "SEK",
    currencySymbol: "kr",
    flag: "SE",
    taxYear: "2025",
    calculate: calculateSE,
    taxLabels: { federal: "Municipal + State Tax", social: "Pension (tj\u00E4nstepension)" },
    defaultSalary: 45000 * 12,
    popularSalaries: [300000, 360000, 420000, 480000, 540000, 600000, 720000, 900000],
    seoDescription: "Calculate your Swedish take-home pay (nettol\u00F6n) for 2025. Includes municipal tax (~32.4%), state income tax (20% above 615,300 SEK), and typical tj\u00E4nstepension deduction.",
  },
  nl: {
    code: "nl",
    name: "Netherlands",
    currency: "EUR",
    currencySymbol: "\u20AC",
    flag: "NL",
    taxYear: "2025",
    calculate: calculateNL,
    taxLabels: { federal: "Income Tax (incl. social premiums)", social: "Additional Deductions" },
    defaultSalary: 45000,
    popularSalaries: [30000, 36000, 45000, 55000, 65000, 80000, 100000, 120000],
    seoDescription: "Calculate your Dutch net salary for 2025. Includes income tax brackets (Box 1), algemene heffingskorting, arbeidskorting, and social premiums. See your monthly nettoloon.",
  },
};

export const countryOrder = ["us", "uk", "ca", "au", "de", "in", "ie", "se", "nl"];
