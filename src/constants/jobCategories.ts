export type JobCategoryId =
  | 'it'
  | 'business-finance'
  | 'management'
  | 'manufacturing-engineering'
  | 'service'
  | 'design-creativity';

export interface JobCategory {
  id: JobCategoryId;
  label: string;
  roles: string[];
}

export const JOB_CATEGORIES: JobCategory[] = [
  {
    id: 'it',
    label: 'IT',
    roles: [
      'Frontend Developer',
      'Backend Developer',
      'Full-stack Developer',
      'DevOps',
      'QA/QC',
      'Data Analyst',
      'Data Scientist',
      'AI/ML Engineer',
      'Product Manager',
      'Project Manager',
      'Business Analyst',
      'System Admin',
    ],
  },
  {
    id: 'business-finance',
    label: 'Business/Finance',
    roles: [
      'Kế toán',
      'Kiểm toán',
      'Tài chính',
      'Ngân hàng',
      'Thuế',
      'Controller',
      'CFO',
    ],
  },
  {
    id: 'management',
    label: 'Management',
    roles: [
      'Giám đốc điều hành',
      'Quản lý dự án',
      'Quản lý sản phẩm',
      'Quản lý vận hành',
      'HR Manager',
    ],
  },
  {
    id: 'manufacturing-engineering',
    label: 'Manufacturing & Engineering',
    roles: [
      'Kỹ sư cơ khí',
      'Kỹ sư điện',
      'Kỹ sư xây dựng',
      'Kỹ sư hóa',
      'QC/QA',
      'Production Manager',
    ],
  },
  {
    id: 'service',
    label: 'Service',
    roles: [
      'Tư vấn',
      'Chăm sóc khách hàng',
      'Sales',
      'Marketing',
      'Nhân sự',
      'Hành chính - Văn phòng',
    ],
  },
  {
    id: 'design-creativity',
    label: 'Design/Creativity',
    roles: [
      'UI/UX Designer',
      'Graphic Designer',
      'Content Writer',
      'Video Editor',
      'Motion Designer',
      'Art Director',
    ],
  },
];
