
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
    locations: 'Hà Nội, TP. HCM (Quận nội thành), Hải Phòng, Đồng Nai, Bình Dương, Bà Rịa - Vũng Tàu (Vũng Tàu, Phú Mỹ).',
    details: [
      'TP. Hà Nội: Các quận và các huyện Gia Lâm, Đông Anh, Sóc Sơn, Thanh Trì, Thường Tín, Hoài Đức, Thạch Thất, Quốc Oai, Thanh Oai, Mê Linh, Chương Mỹ và TP. Sơn Tây.',
      'TP. Hồ Chí Minh: Các quận, TP. Thủ Đức và các huyện Củ Chi, Hóc Môn, Bình Chánh, Nhà Bè.',
      'TP. Hải Phòng: Các quận và các huyện Thủy Nguyên, An Dương, An Lão, Vĩnh Bảo, Tiên Lãng, Cát Hải, Kiến Thụy.',
      'Tỉnh Đồng Nai: TP. Biên Hòa, Long Khánh và các huyện Nhơn Trạch, Long Thành, Vĩnh Cửu, Trảng Bom, Xuân Lộc.',
      'Tỉnh Bình Dương: TP. Thủ Dầu Một, Thuận An, Dĩ An, Tân Uyên, Bến Cát và các huyện Bắc Tân Uyên, Dầu Tiếng, Phú Giáo, Bàu Bàng.',
      'Tỉnh Bà Rịa - Vũng Tàu: TP. Vũng Tàu, Phú Mỹ.'
    ]
  },
  [Region.II]: {
    name: 'Vùng II',
    wage: 4730000,
    locations: 'Hà Nội & HCM (Huyện còn lại); Đà Nẵng, Cần Thơ, Nha Trang, Đà Lạt, Phan Thiết...',
    details: [
      'TP. Hà Nội: Các huyện còn lại (Ba Vì, Mỹ Đức, Phú Xuyên, Phúc Thọ, Ứng Hòa).',
      'TP. Hồ Chí Minh: Huyện Cần Giờ.',
      'TP. Đà Nẵng: Các quận, huyện.',
      'TP. Cần Thơ: Các quận.',
      'Tỉnh Bà Rịa - Vũng Tàu: TP. Bà Rịa.',
      'Tỉnh Khánh Hòa: TP. Nha Trang, Cam Ranh.',
      'Tỉnh Lâm Đồng: TP. Đà Lạt, Bảo Lộc.',
      'Tỉnh Bình Thuận: TP. Phan Thiết.',
      'Tỉnh Thái Nguyên: TP. Thái Nguyên, Sông Công, Phổ Yên.',
      'Tỉnh Bắc Ninh: TP. Bắc Ninh, Từ Sơn và các huyện Quế Võ, Tiên Du, Yên Phong, Thuận Thành, Gia Bình, Lương Tài.',
      'Tỉnh Quảng Ninh: TP. Hạ Long, Cẩm Phả, Uông Bí, Móng Cái.'
    ]
  },
  [Region.III]: {
    name: 'Vùng III',
    wage: 4140000,
    locations: 'Các thành phố, thị xã trực thuộc tỉnh còn lại và các huyện có kinh tế phát triển.',
    details: [
      'Các thành phố trực thuộc tỉnh còn lại (trừ Vùng I, II).',
      'Các thị xã trực thuộc tỉnh còn lại.',
      'Các huyện: Đức Hòa, Bến Lức, Cần Đước, Cần Giuộc (Long An).',
      'Các huyện: Trảng Bàng, Gò Dầu (Tây Ninh).',
      'Các huyện: Thống Nhất, Cẩm Mỹ (Đồng Nai).',
      'Các huyện: Phú Quốc (Kiên Giang).'
    ]
  },
  [Region.IV]: {
    name: 'Vùng IV',
    wage: 3700000,
    locations: 'Các địa bàn còn lại (khu vực nông thôn, vùng sâu vùng xa).',
    details: [
      'Toàn bộ các địa bàn không thuộc danh mục Vùng I, Vùng II và Vùng III.',
      'Khu vực nông nghiệp và các địa bàn khó khăn.'
    ]
  }
};

export const BASE_SALARY = 2340000;
export const MAX_INSURANCE_BASE = BASE_SALARY * 20;

export const EMPLOYEE_INSURANCE_RATES = {
  BHXH: 0.08,
  BHYT: 0.015,
  BHTN: 0.01,
  TOTAL: 0.105
};

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
