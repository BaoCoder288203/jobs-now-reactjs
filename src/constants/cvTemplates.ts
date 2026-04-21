export type CVTemplateKey =
  | 'cvhay-industry'
  | 'cvhay-student'
  | 'cvhay-industry-safety'
  | 'cvhay-automotive'
  | 'cvhay-customer-service'
  | 'cvhay-specialist'
  | 'cvhay-management'
  | 'cvhay-media'
  | 'cvhay-it-software'
  | 'cvhay-sales';

export type CVTemplateFamily = 'dark-sidebar' | 'automotive' | 'service' | 'specialist' | 'student' | 'sales' | 'it-software';

export interface CVTemplateOption {
  key: CVTemplateKey;
  name: string;
  sourceLabel: string;
  description: string;
  bestFor: string;
  family: CVTemplateFamily;
  category: string;
  accentFrom: string;
  accentTo: string;
  featured: boolean;
  popular: boolean;
}

export const DEFAULT_CV_TEMPLATE_KEY: CVTemplateKey = 'cvhay-industry-safety';

export const CV_TEMPLATE_OPTIONS: CVTemplateOption[] = [
  {
    key: 'cvhay-industry-safety',
    name: 'CVHay Ngành Khác',
    sourceLabel: 'CVHay Ngành Khác',
    description: 'Bố cục mạnh, nhấn thông tin trọng tâm và kinh nghiệm thực chiến.',
    bestFor: 'Ngành khác, an toàn lao động',
    family: 'dark-sidebar',
    category: 'Ngành khác, đa lĩnh vực',
    accentFrom: '#24323d',
    accentTo: '#f3af3e',
    featured: true,
    popular: true,
  },
  {
    key: 'cvhay-automotive',
    name: 'CVHay Cơ Khí Ô Tô',
    sourceLabel: 'CVHay Cơ Khí Ô Tô',
    description: 'Thiết kế kỹ thuật rõ ràng, nổi bật kỹ năng chuyên môn và quy trình.',
    bestFor: 'Cơ khí, ô tô, tự động hóa',
    family: 'automotive',
    category: 'Cơ khí / Ô tô / Tự động hóa',
    accentFrom: '#eaf2ff',
    accentTo: '#2a69d1',
    featured: true,
    popular: true,
  },
  {
    key: 'cvhay-customer-service',
    name: 'CVHay Dịch Vụ Khách Hàng',
    sourceLabel: 'CVHay Dịch Vụ Khách Hàng',
    description: 'Nhấn mạnh kỹ năng giao tiếp, xử lý tình huống và trải nghiệm khách hàng.',
    bestFor: 'Dịch vụ khách hàng',
    family: 'service',
    category: 'Dịch vụ khách hàng',
    accentFrom: '#0e4f73',
    accentTo: '#1e9ed8',
    featured: true,
    popular: true,
  },
  {
    key: 'cvhay-specialist',
    name: 'CVHay Chuyên Viên',
    sourceLabel: 'CVHay Chuyên Viên',
    description: 'Phong cách tối giản tinh gọn, tập trung tính chuyên nghiệp.',
    bestFor: 'Chuyên viên nghiệp vụ',
    family: 'specialist',
    category: 'Ngành khác',
    accentFrom: '#f3b315',
    accentTo: '#f6cd62',
    featured: true,
    popular: false,
  },
  {
    key: 'cvhay-student',
    name: 'CVHay Sinh Viên',
    sourceLabel: 'CVHay Sinh Viên',
    description: 'Ưu tiên học vấn, dự án, hoạt động ngoại khóa và tiềm năng phát triển.',
    bestFor: 'Mới tốt nghiệp / Thực tập',
    family: 'student',
    category: 'Mới tốt nghiệp, thực tập',
    accentFrom: '#f5b520',
    accentTo: '#ffd56f',
    featured: true,
    popular: true,
  },
  {
    key: 'cvhay-management',
    name: 'CVHay Quản Lý',
    sourceLabel: 'CVHay Quản Lý',
    description: 'Đặt trọng tâm vào thành tích, KPI và năng lực điều phối đội nhóm.',
    bestFor: 'Quản lý điều hành',
    family: 'dark-sidebar',
    category: 'Quản lý điều hành',
    accentFrom: '#1f2937',
    accentTo: '#10b981',
    featured: false,
    popular: true,
  },
  {
    key: 'cvhay-media',
    name: 'CVHay Truyền Thông',
    sourceLabel: 'CVHay Truyền Thông',
    description: 'Bố cục giàu điểm nhấn thị giác, hợp hồ sơ truyền thông - marketing.',
    bestFor: 'Quảng cáo / Đối ngoại / Truyền thông',
    family: 'service',
    category: 'Truyền thông / Marketing',
    accentFrom: '#0ea5a4',
    accentTo: '#2dd4bf',
    featured: false,
    popular: true,
  },
  {
    key: 'cvhay-it-software',
    name: 'CVHay IT Phần Mềm',
    sourceLabel: 'CVHay IT Phần Mềm',
    description: 'Mẫu công nghệ với cấu trúc kỹ năng, dự án và stack rõ ràng.',
    bestFor: 'IT - Phần mềm',
    family: 'it-software',
    category: 'IT - Phần mềm',
    accentFrom: '#0f172a',
    accentTo: '#1d4ed8',
    featured: true,
    popular: true,
  },
  {
    key: 'cvhay-sales',
    name: 'CVHay Bán Hàng',
    sourceLabel: 'CVHay Bán Hàng',
    description: 'Nhấn mạnh kết quả doanh số và năng lực mở rộng tệp khách hàng.',
    bestFor: 'Bán hàng / Kinh doanh',
    family: 'sales',
    category: 'Bán hàng / Kinh doanh',
    accentFrom: '#14532d',
    accentTo: '#22c55e',
    featured: true,
    popular: true,
  },
];

const TEMPLATE_KEY_LOOKUP = new Map<CVTemplateKey, CVTemplateOption>(
  CV_TEMPLATE_OPTIONS.map((item) => [item.key, item])
);

export function normalizeCVTemplateKey(value?: string | null): CVTemplateKey {
  const normalized = (value ?? '').trim().toLowerCase() as CVTemplateKey;

  if (normalized === 'cvhay-industry') {
    return 'cvhay-industry-safety';
  }
  if (normalized === 'cvhay-student') {
    return 'cvhay-student';
  }

  return TEMPLATE_KEY_LOOKUP.has(normalized) ? normalized : DEFAULT_CV_TEMPLATE_KEY;
}

export function getCVTemplateOptionByKey(value?: string | null): CVTemplateOption {
  const key = normalizeCVTemplateKey(value);
  return TEMPLATE_KEY_LOOKUP.get(key) ?? CV_TEMPLATE_OPTIONS[0];
}

export function recommendCVTemplate(input: {
  title?: string | null;
  summary?: string | null;
  workExperienceCount?: number;
}): CVTemplateKey {
  const title = (input.title ?? '').toLowerCase();
  const summary = (input.summary ?? '').toLowerCase();
  const joined = `${title} ${summary}`;

  const studentSignals = /(intern|fresher|student|thực tập|thuc tap|sinh viên|sinh vien|mới ra trường|moi ra truong)/;
  const automotiveSignals = /(cơ khí|co khi|ô tô|o to|automotive|mechanic|autocad|solidworks)/;
  const serviceSignals = /(dịch vụ|dich vu|customer service|support|chăm sóc khách hàng|cham soc khach hang)/;
  const mediaSignals = /(truyền thông|truyen thong|marketing|content|social media|digital)/;
  const managementSignals = /(manager|quản lý|quan ly|lead|head of|trưởng phòng|truong phong)/;
  const salesSignals = /(sales|kinh doanh|bán hàng|ban hang|account executive|business development)/;
  const itSignals = /(developer|software|frontend|backend|fullstack|devops|engineer|it|lập trình|lap trinh)/;

  if (studentSignals.test(joined)) {
    return 'cvhay-student';
  }

  if (automotiveSignals.test(joined)) {
    return 'cvhay-automotive';
  }

  if (serviceSignals.test(joined)) {
    return 'cvhay-customer-service';
  }

  if (mediaSignals.test(joined)) {
    return 'cvhay-media';
  }

  if (managementSignals.test(joined)) {
    return 'cvhay-management';
  }

  if (salesSignals.test(joined)) {
    return 'cvhay-sales';
  }

  if (itSignals.test(joined)) {
    return 'cvhay-it-software';
  }

  if ((input.workExperienceCount ?? 0) === 0 && joined.length > 0) {
    return 'cvhay-student';
  }

  return DEFAULT_CV_TEMPLATE_KEY;
}
