
export enum CalculationMode {
  GROSS_TO_NET = 'GROSS_TO_NET',
  NET_TO_GROSS = 'NET_TO_GROSS'
}

export enum Region {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV'
}

export interface CalculationInput {
  mode: CalculationMode;
  salary: number;
  taxableAllowance: number; // Phụ cấp chịu thuế - Không đóng BHXH
  dependents: number;
  region: Region;
  isExpat: boolean;
  isProbation: boolean;
}

export interface InsuranceBreakdown {
  bhxh: number;
  bhyt: number;
  bhtn: number;
  total: number;
}

export interface TaxBracket {
  limit: number;
  rate: number;
  amount: number;
  label: string;
}

export interface CalculationResult {
  gross: number;
  taxableAllowance: number;
  net: number;
  insurance: InsuranceBreakdown;
  taxableIncome: number; // Thu nhập tính thuế
  incomeBeforeTax: number; // Thu nhập trước thuế
  tax: number;
  taxBrackets: TaxBracket[];
  employerCost: number;
  comparisonWith2025: {
    net2025: number;
    increase: number;
    increasePercentage: number;
  };
}
