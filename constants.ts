
import { Region } from './types';

export const REGION_MIN_WAGE = {
  [Region.I]: 5310000,
  [Region.II]: 4730000,
  [Region.III]: 4140000,
  [Region.IV]: 3700000
};

export const REGION_DETAILS = {
  [Region.I]: {
    name: 'Vùng I',
    wage: 5310000,
    locations: 'Hà Nội, TP. HCM (Quận nội thành), Hải Phòng, Đồng Nai, Bình Dương, Bà Rịa - Vũng Tàu (TP. Vũng Tàu, Phú Mỹ).',
    description: 'Khu vực đô thị đặc biệt và các trung tâm công nghiệp lớn nhất.'
  },
  [Region.II]: {
    name: 'Vùng II',
    wage: 4730000,
    locations: 'Hà Nội, TP. HCM (Các huyện ngoại thành); Đà Nẵng, Cần Thơ, Nha Trang, Bắc Ninh, Thái Nguyên (Các thành phố trực thuộc).',
    description: 'Các thành phố trực thuộc trung ương còn lại và các đô thị loại I.'
  },
  [Region.III]: {
    name: 'Vùng III',
    wage: 4140000,
    locations: 'Các thành phố, thị xã trực thuộc tỉnh còn lại và một số huyện có kinh tế phát triển.',
    description: 'Các khu vực đô thị loại II, III và các địa bàn đang phát triển.'
  },
  [Region.IV]: {
    name: 'Vùng IV',
    wage: 3700000,
    locations: 'Các địa bàn còn lại (khu vực nông thôn, vùng sâu vùng xa).',
    description: 'Khu vực nông nghiệp và các địa bàn khó khăn.'
  }
};

export const BASE_SALARY = 2340000; // Mức lương tham chiếu 2026
export const MAX_INSURANCE_BASE = BASE_SALARY * 20; // 46,800,000 VND cho BHXH/BHYT

// Tỷ lệ đóng bảo hiểm của Người lao động (Employee)
export const EMPLOYEE_INSURANCE_RATES = {
  BHXH: 0.08,
  BHYT: 0.015,
  BHTN: 0.01,
  TOTAL: 0.105
};

// Tỷ lệ đóng bảo hiểm của Người sử dụng lao động (Employer)
export const EMPLOYER_INSURANCE_RATES = {
  BHXH: 0.175,
  BHYT: 0.03,
  BHTN: 0.01,
  TOTAL: 0.215
};

export const DEDUCTIONS = {
  PERSONAL_2026: 15500000,
  DEPENDENT_2026: 6200000,
  PERSONAL_2025: 11000000,
  DEPENDENT_2025: 4400000
};

export const TAX_BRACKETS_2026 = [
  { limit: 10000000, rate: 0.05 },
  { limit: 30000000, rate: 0.10 },
  { limit: 60000000, rate: 0.20 },
  { limit: 100000000, rate: 0.30 },
  { limit: Infinity, rate: 0.35 }
];

export const TAX_BRACKETS_2025 = [
  { limit: 5000000, rate: 0.05 },
  { limit: 10000000, rate: 0.10 },
  { limit: 18000000, rate: 0.15 },
  { limit: 32000000, rate: 0.20 },
  { limit: 52000000, rate: 0.25 },
  { limit: 80000000, rate: 0.30 },
  { limit: Infinity, rate: 0.35 }
];
