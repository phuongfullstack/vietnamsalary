
import { CalculationInput, CalculationResult, CalculationMode, Region, InsuranceBreakdown, TaxBracket } from '../types';
import { REGION_MIN_WAGE, DEDUCTIONS, TAX_BRACKETS_2026, TAX_BRACKETS_2025, MAX_INSURANCE_BASE, EMPLOYEE_INSURANCE_RATES, EMPLOYER_INSURANCE_RATES } from '../constants';

/**
 * Formats a number with Vietnamese currency style (dots as thousands separators)
 */
export const formatCurrency = (amount: number): string => {
  if (amount === 0) return '0';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
};

/**
 * Strips non-digit characters from a string for numeric processing
 */
export const parseRawInput = (value: string): number => {
  const numericString = value.replace(/[^0-9]/g, '');
  return numericString === '' ? 0 : parseInt(numericString, 10);
};

function calculateInsurance(gross: number, region: Region, isExpat: boolean, isProbation: boolean): InsuranceBreakdown {
  if (isProbation) {
    return { bhxh: 0, bhyt: 0, bhtn: 0, total: 0 };
  }

  const baseForBH = Math.min(gross, MAX_INSURANCE_BASE);
  const baseForBHTN = Math.min(gross, REGION_MIN_WAGE[region] * 20);

  const bhxh = Math.round(EMPLOYEE_INSURANCE_RATES.BHXH * baseForBH);
  const bhyt = Math.round(EMPLOYEE_INSURANCE_RATES.BHYT * baseForBH);
  const bhtn = isExpat ? 0 : Math.round(EMPLOYEE_INSURANCE_RATES.BHTN * baseForBHTN);

  return {
    bhxh,
    bhyt,
    bhtn,
    total: bhxh + bhyt + bhtn
  };
}

function calculatePIT(taxableIncome: number, brackets: { limit: number; rate: number }[], isProbation: boolean, totalIncome: number): { total: number; breakdown: TaxBracket[] } {
  if (isProbation) {
    const tax = totalIncome >= 2000000 ? Math.round(totalIncome * 0.1) : 0;
    return {
      total: tax,
      breakdown: tax > 0 ? [{ limit: Infinity, rate: 0.1, amount: tax, label: 'Thuế khoán 10%' }] : []
    };
  }

  if (taxableIncome <= 0) return { total: 0, breakdown: [] };

  let remaining = taxableIncome;
  let totalTax = 0;
  const breakdown: TaxBracket[] = [];
  let prevLimit = 0;

  for (const bracket of brackets) {
    const range = bracket.limit - prevLimit;
    const taxableInThisBracket = Math.min(remaining, range);
    
    if (taxableInThisBracket > 0) {
      const tax = Math.round(taxableInThisBracket * bracket.rate);
      totalTax += tax;
      breakdown.push({
        limit: bracket.limit,
        rate: bracket.rate,
        amount: tax,
        label: `Bậc ${breakdown.length + 1}`
      });
      remaining -= taxableInThisBracket;
    }
    
    if (remaining <= 0) break;
    prevLimit = bracket.limit;
  }

  return { total: Math.round(totalTax), breakdown };
}

function calculateFull(gross: number, taxableAllowance: number, input: CalculationInput, is2026: boolean): { net: number; insurance: InsuranceBreakdown; taxableIncome: number; incomeBeforeTax: number; tax: number; taxBrackets: TaxBracket[] } {
  const insurance = calculateInsurance(gross, input.region, input.isExpat, input.isProbation);
  const totalIncome = gross + taxableAllowance;
  const incomeBeforeTax = totalIncome - insurance.total;
  
  const personalDeduction = is2026 ? DEDUCTIONS.PERSONAL_2026 : DEDUCTIONS.PERSONAL_2025;
  const dependentDeduction = (is2026 ? DEDUCTIONS.DEPENDENT_2026 : DEDUCTIONS.DEPENDENT_2025) * input.dependents;
  
  const taxableIncome = Math.max(0, incomeBeforeTax - personalDeduction - dependentDeduction);
  const brackets = is2026 ? TAX_BRACKETS_2026 : TAX_BRACKETS_2025;
  
  const { total: tax, breakdown } = calculatePIT(taxableIncome, brackets, input.isProbation, totalIncome);
  
  const net = incomeBeforeTax - tax;

  return { net, insurance, taxableIncome, incomeBeforeTax, tax, taxBrackets: breakdown };
}

function findGrossFromNet(netTarget: number, input: CalculationInput, is2026: boolean): number {
  let low = 0;
  let high = netTarget * 3 + 10000000;
  let iterations = 0;
  
  while (iterations < 100) {
    const mid = (low + high) / 2;
    // Note: In NET_TO_GROSS, we solve for Gross while taxableAllowance is a fixed input
    const calc = calculateFull(mid, input.taxableAllowance, input, is2026);
    if (Math.abs(calc.net - netTarget) < 1) return Math.round(mid);
    if (calc.net < netTarget) {
      low = mid;
    } else {
      high = mid;
    }
    iterations++;
  }
  return Math.round((low + high) / 2);
}

export function performCalculation(input: CalculationInput): CalculationResult {
  let gross = input.mode === CalculationMode.GROSS_TO_NET ? input.salary : 0;
  
  if (input.mode === CalculationMode.NET_TO_GROSS) {
    gross = findGrossFromNet(input.salary, input, true);
  }

  const result2026 = calculateFull(gross, input.taxableAllowance, input, true);
  const result2025 = calculateFull(gross, input.taxableAllowance, input, false);

  const baseForBH = Math.min(gross, MAX_INSURANCE_BASE);
  const baseForBHTN = Math.min(gross, REGION_MIN_WAGE[input.region] * 20);
  
  const employerInsurance = input.isProbation ? 0 : Math.round((EMPLOYER_INSURANCE_RATES.BHXH * baseForBH) + (EMPLOYER_INSURANCE_RATES.BHYT * baseForBH) + (input.isExpat ? 0 : EMPLOYER_INSURANCE_RATES.BHTN * baseForBHTN));

  return {
    gross: Math.round(gross),
    taxableAllowance: input.taxableAllowance,
    net: Math.round(result2026.net),
    insurance: result2026.insurance,
    incomeBeforeTax: Math.round(result2026.incomeBeforeTax),
    taxableIncome: Math.round(result2026.taxableIncome),
    tax: Math.round(result2026.tax),
    taxBrackets: result2026.taxBrackets,
    employerCost: Math.round(gross + input.taxableAllowance + employerInsurance),
    comparisonWith2025: {
      net2025: Math.round(result2025.net),
      increase: Math.round(result2026.net - result2025.net),
      increasePercentage: result2025.net > 0 ? ((result2026.net / result2025.net) - 1) * 100 : 0
    }
  };
}
