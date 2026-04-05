import { useMemo, useRef, useState } from 'react';
import { Check, Eye, Flame, MapPin, Search, Sparkles, Upload, UserCircle2 } from 'lucide-react';
import type { CVTemplateKey, CVTemplateOption } from '@/constants/cvTemplates';
import { CV_TEMPLATE_OPTIONS, getCVTemplateOptionByKey } from '@/constants/cvTemplates';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CVPreview } from './CVPreview';
import type { ExtractedCVData } from '@/types';

interface CVTemplatePickerProps {
  selectedTemplateKey: CVTemplateKey;
  recommendedTemplateKey: CVTemplateKey;
  onChange: (templateKey: CVTemplateKey) => void;
  onTemplateApplied?: () => void;
}

function getPreviewDataByTemplate(templateKey: CVTemplateKey): ExtractedCVData {
  if (templateKey === 'cvhay-automotive') {
    return {
      fullName: 'Nguyen Van A',
      title: 'Kỹ sư Cơ khí Ô tô',
      headline: 'Automotive Mechanical Engineer',
      email: 'mechanic@example.com',
      phone: '0912 111 222',
      address: 'Da Nang, Viet Nam',
      summary: 'Kỹ sư cơ khí với kinh nghiệm bảo trì hệ thống truyền động, tối ưu quy trình kiểm định và giảm lỗi dây chuyền sản xuất.',
      work_experiences: [
        {
          company: 'AutoTech Vietnam',
          position: 'Kỹ sư bảo trì',
          start_date: '02/2022',
          end_date: 'Hiện tại',
          description: '- Tối ưu checklist bảo trì định kỳ.\n- Giảm 18% downtime dây chuyền.',
        },
      ],
      educations: [
        {
          school: 'ĐH Sư phạm Kỹ thuật',
          major: 'Cơ điện tử',
          degree: 'Kỹ sư',
          start_date: '2017',
          end_date: '2021',
        },
      ],
      skills: [{ name: 'AutoCAD' }, { name: 'SolidWorks' }, { name: 'PLC' }, { name: 'Lean' }],
      projects: [{ name: 'Line Health Monitoring', description: 'Giám sát rung động và cảnh báo sớm lỗi.', duration: '2024' }],
      languages: [{ name: 'English', proficiency: 'TOEIC 650' }],
      certificates: [{ name: 'Lean Six Sigma Yellow Belt', issuer: 'ASQ', issue_date: '2023' }],
    };
  }

  if (templateKey === 'cvhay-customer-service') {
    return {
      fullName: 'Tran Thi B',
      title: 'Customer Service Executive',
      headline: 'Customer Success Specialist',
      email: 'service@example.com',
      phone: '0933 000 999',
      address: 'Ho Chi Minh, Viet Nam',
      summary: 'Chuyên viên dịch vụ khách hàng với khả năng xử lý khiếu nại đa kênh, duy trì CSAT cao và cải thiện quy trình hậu mãi.',
      work_experiences: [
        {
          company: 'RetailHub',
          position: 'Customer Service',
          start_date: '03/2023',
          end_date: 'Hiện tại',
          description: '- Duy trì CSAT 4.8/5.\n- Rút ngắn thời gian xử lý ticket còn 4 giờ.',
        },
      ],
      educations: [
        {
          school: 'ĐH Kinh tế TP.HCM',
          major: 'Quản trị kinh doanh',
          degree: 'Cử nhân',
          start_date: '2018',
          end_date: '2022',
        },
      ],
      skills: [{ name: 'CRM' }, { name: 'Communication' }, { name: 'Problem Solving' }, { name: 'Multitask' }],
      projects: [{ name: 'Voice of Customer', description: 'Chuẩn hóa form phản hồi và dashboard theo dõi.', duration: '2024' }],
      languages: [{ name: 'English', proficiency: 'Advanced' }],
      certificates: [{ name: 'Customer Service Excellence', issuer: 'HubSpot', issue_date: '2024' }],
    };
  }

  if (templateKey === 'cvhay-management') {
    return {
      fullName: 'Le Van C',
      title: 'Operations Manager',
      headline: 'Quản lý vận hành',
      email: 'manager@example.com',
      phone: '0909 668 889',
      address: 'Ha Noi, Viet Nam',
      summary: 'Quản lý vận hành với 7+ năm kinh nghiệm điều phối đội ngũ, triển khai KPI và tối ưu chi phí vận hành đa chi nhánh.',
      work_experiences: [
        {
          company: 'FastMove Logistics',
          position: 'Operations Manager',
          start_date: '01/2021',
          end_date: 'Hiện tại',
          description: '- Tăng năng suất đội giao nhận 22%.\n- Giảm chi phí vận hành 15% sau 12 tháng.',
        },
      ],
      educations: [
        {
          school: 'ĐH Ngoại thương',
          major: 'Kinh doanh quốc tế',
          degree: 'Cử nhân',
          start_date: '2012',
          end_date: '2016',
        },
      ],
      skills: [{ name: 'Leadership' }, { name: 'KPI Planning' }, { name: 'Process Improvement' }, { name: 'Negotiation' }],
      projects: [{ name: 'Regional KPI Dashboard', description: 'Đồng bộ báo cáo KPI 4 vùng vận hành.', duration: '2023' }],
      languages: [{ name: 'English', proficiency: 'Business' }],
      certificates: [{ name: 'PMP', issuer: 'PMI', issue_date: '2022' }],
    };
  }

  if (templateKey === 'cvhay-media') {
    return {
      fullName: 'Pham Thu D',
      title: 'Marketing Executive',
      headline: 'Truyền thông thương hiệu',
      email: 'media@example.com',
      phone: '0941 112 223',
      address: 'Ho Chi Minh, Viet Nam',
      summary: 'Phụ trách truyền thông đa nền tảng, định vị thương hiệu và xây dựng chiến dịch content theo data.',
      work_experiences: [
        {
          company: 'MediaOne',
          position: 'Marketing Executive',
          start_date: '04/2022',
          end_date: 'Hiện tại',
          description: '- Tăng 35% organic reach trong 6 tháng.\n- Triển khai 12 chiến dịch tích hợp mỗi năm.',
        },
      ],
      educations: [
        {
          school: 'Học viện Báo chí',
          major: 'Quan hệ công chúng',
          degree: 'Cử nhân',
          start_date: '2017',
          end_date: '2021',
        },
      ],
      skills: [{ name: 'Content Strategy' }, { name: 'SEO' }, { name: 'Ads' }, { name: 'Analytics' }],
      projects: [{ name: 'Brand Refresh 2024', description: 'Tái định vị visual và thông điệp thương hiệu.', duration: '2024' }],
      languages: [{ name: 'English', proficiency: 'Advanced' }],
      certificates: [{ name: 'Google Analytics', issuer: 'Google', issue_date: '2024' }],
    };
  }

  if (templateKey === 'cvhay-it-software') {
    return {
      fullName: 'Nguyen Van A',
      title: 'Frontend Developer',
      headline: 'React/TypeScript Engineer',
      email: 'dev@example.com',
      phone: '0901 234 567',
      address: 'Ho Chi Minh, Viet Nam',
      summary: 'Lập trình viên frontend tập trung hiệu năng và trải nghiệm người dùng trên web tuyển dụng quy mô lớn.',
      work_experiences: [
        {
          company: 'JobsNow Vietnam',
          position: 'Frontend Developer',
          start_date: '01/2024',
          end_date: 'Hiện tại',
          description: '- Xây dựng hệ thống component tái sử dụng.\n- Giảm 27% thời gian tải trang chính.',
        },
      ],
      educations: [
        {
          school: 'ĐH Bách Khoa',
          major: 'Khoa học máy tính',
          degree: 'Cử nhân',
          start_date: '2019',
          end_date: '2023',
        },
      ],
      skills: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Redux Toolkit' }, { name: 'Node.js' }],
      projects: [{ name: 'Talent Pipeline UI', description: 'Module theo dõi ứng viên realtime.', duration: '2025' }],
      languages: [{ name: 'English', proficiency: 'Intermediate' }],
      certificates: [{ name: 'AWS Cloud Practitioner', issuer: 'AWS', issue_date: '2024' }],
    };
  }

  if (templateKey === 'cvhay-sales') {
    return {
      fullName: 'Do Thi E',
      title: 'Sales Executive',
      headline: 'Bán hàng doanh nghiệp',
      email: 'sales@example.com',
      phone: '0977 111 999',
      address: 'Can Tho, Viet Nam',
      summary: 'Tập trung mở rộng thị trường B2B, phát triển hệ thống khách hàng trung thành và đạt chỉ tiêu doanh số liên tục.',
      work_experiences: [
        {
          company: 'SunTrade',
          position: 'Sales Executive',
          start_date: '06/2021',
          end_date: 'Hiện tại',
          description: '- Hoàn thành 130% KPI năm 2024.\n- Phát triển thêm 50+ khách hàng doanh nghiệp.',
        },
      ],
      educations: [
        {
          school: 'ĐH Kinh tế Quốc dân',
          major: 'Marketing',
          degree: 'Cử nhân',
          start_date: '2016',
          end_date: '2020',
        },
      ],
      skills: [{ name: 'Negotiation' }, { name: 'Closing' }, { name: 'Account Management' }, { name: 'CRM' }],
      projects: [{ name: 'Enterprise Expansion', description: 'Mở rộng tệp khách hàng SME khu vực phía Nam.', duration: '2024' }],
      languages: [{ name: 'English', proficiency: 'Business' }],
      certificates: [{ name: 'B2B Sales Strategy', issuer: 'LinkedIn Learning', issue_date: '2023' }],
    };
  }

  return {
    fullName: 'Nguyen Van A',
    title: templateKey === 'cvhay-student' ? 'Intern Frontend' : 'Chuyên viên vận hành',
    headline: templateKey === 'cvhay-student' ? 'Mới tốt nghiệp / Thực tập' : 'Hồ sơ ứng tuyển chuẩn ATS',
    email: 'example@gmail.com',
    phone: '0901 234 567',
    address: 'Ho Chi Minh, Viet Nam',
    summary:
      templateKey === 'cvhay-student'
        ? 'Sinh viên mới tốt nghiệp với nền tảng vững về kỹ năng chuyên môn, chủ động học hỏi và tham gia nhiều dự án thực tế.'
        : 'Hồ sơ tập trung vào thành tích chính, kinh nghiệm nổi bật và giá trị có thể đóng góp cho doanh nghiệp.',
    work_experiences: [
      {
        company: 'Công ty ABC',
        position: templateKey === 'cvhay-student' ? 'Intern' : 'Chuyên viên',
        start_date: '2024',
        end_date: 'Hiện tại',
        description: '- Tham gia vận hành quy trình và phối hợp liên phòng ban.\n- Đảm bảo tiến độ theo KPI.',
      },
    ],
    educations: [
      {
        school: 'Đại học Kinh tế',
        major: 'Quản trị kinh doanh',
        degree: 'Cử nhân',
        start_date: '2020',
        end_date: '2024',
      },
    ],
    skills: [{ name: 'Communication' }, { name: 'Teamwork' }, { name: 'Problem Solving' }, { name: 'MS Office' }],
    projects: [{ name: 'Career Project', description: 'Nghiên cứu và triển khai chiến lược tìm việc hiệu quả.', duration: '2024' }],
    languages: [{ name: 'English', proficiency: 'Intermediate' }],
    certificates: [{ name: 'Career Readiness', issuer: 'Coursera', issue_date: '2024' }],
  };
}

function TemplateThumbnail({ option }: { option: CVTemplateOption }) {
  if (option.family === 'dark-sidebar') {
    return (
      <div className="h-full w-full rounded-xl border border-gray-200 bg-white p-2">
        <div className="grid h-full grid-cols-[34%_1fr] gap-2 overflow-hidden rounded-lg">
          <div className="bg-[#2f3f49] p-2 text-[8px] text-white">
            <div className="mx-auto mb-2 h-8 w-8 rounded-full border-2 border-white/70 bg-white/20" />
            <div className="mb-1 h-2 rounded" style={{ backgroundColor: option.accentTo }} />
            <div className="space-y-1">
              <div className="h-1.5 rounded bg-white/70" />
              <div className="h-1.5 rounded bg-white/50" />
              <div className="h-1.5 w-4/5 rounded bg-white/50" />
            </div>
          </div>
          <div className="p-1.5">
            <div className="mb-1 h-1.5 rounded bg-gray-200" />
            <div className="mb-2 h-1.5 w-3/4 rounded bg-gray-300" />
            <div className="space-y-1">
              <div className="h-1.5 rounded bg-gray-200" />
              <div className="h-1.5 rounded bg-gray-100" />
              <div className="h-1.5 w-11/12 rounded bg-gray-100" />
              <div className="h-1.5 w-4/5 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (option.family === 'automotive') {
    return (
      <div className="h-full w-full rounded-xl border border-gray-200 bg-white p-2">
        <div className="relative h-full overflow-hidden rounded-lg border border-gray-100 bg-white p-2">
          <div className="mb-1 h-1.5 w-1/2 rounded bg-[#2a69d1]" />
          <div className="absolute left-1/2 top-2 h-9 w-9 -translate-x-1/2 rounded-full border-2 border-[#2a69d1] bg-white" />
          <div className="mt-10 space-y-1">
            <div className="h-1.5 rounded bg-gray-200" />
            <div className="h-1.5 w-5/6 rounded bg-gray-100" />
            <div className="h-1.5 w-2/3 rounded bg-gray-100" />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="h-7 rounded bg-[#eaf2ff]" />
            <div className="h-7 rounded bg-[#eaf2ff]" />
          </div>
        </div>
      </div>
    );
  }

  if (option.family === 'service') {
    return (
      <div className="h-full w-full rounded-xl border border-gray-200 bg-white p-2">
        <div className="h-full overflow-hidden rounded-lg border border-gray-100 bg-white p-2">
          <div className="mb-2 h-4 rounded" style={{ backgroundColor: option.accentFrom }} />
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-200" />
            <div className="h-1.5 w-3/4 rounded bg-gray-100" />
          </div>
          <div className="my-2 grid grid-cols-2 gap-2">
            <div className="h-2 rounded" style={{ backgroundColor: option.accentFrom }} />
            <div className="h-2 rounded" style={{ backgroundColor: option.accentFrom }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-10 rounded bg-gray-100" />
            <div className="h-10 rounded bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-xl border border-gray-200 bg-white p-2">
      <div className="h-full overflow-hidden rounded-lg border border-gray-100 bg-white p-2">
        <div className="mx-auto mb-2 h-8 w-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: option.accentTo }} />
        <div className="mb-2 h-2 rounded" style={{ backgroundColor: option.accentFrom }} />
        <div className="space-y-1">
          <div className="h-1.5 rounded bg-gray-200" />
          <div className="h-1.5 w-10/12 rounded bg-gray-100" />
          <div className="h-1.5 w-3/4 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export function CVTemplatePicker({
  selectedTemplateKey,
  recommendedTemplateKey,
  onChange,
  onTemplateApplied,
}: CVTemplatePickerProps) {
  const [activeFilter, setActiveFilter] = useState<'featured' | 'all' | 'popular'>('featured');
  const [keyword, setKeyword] = useState('');
  const [previewTemplateKey, setPreviewTemplateKey] = useState<CVTemplateKey | null>(null);
  const [previewLanguage, setPreviewLanguage] = useState<'vi' | 'en'>('vi');
  const [previewAccentColor, setPreviewAccentColor] = useState<string | undefined>(undefined);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | undefined>(undefined);
  const previewAvatarInputRef = useRef<HTMLInputElement>(null);

  const previewColorOptions = ['#f3af3e', '#2a69d1', '#0e4f73', '#0f172a', '#10b981', '#ec4899'];

  const applyTemplate = (templateKey: CVTemplateKey) => {
    onChange(templateKey);
    onTemplateApplied?.();
  };

  const filteredOptions = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return CV_TEMPLATE_OPTIONS.filter((option) => {
      const byFilter = activeFilter === 'all'
        ? true
        : activeFilter === 'featured'
          ? option.featured
          : option.popular;

      if (!byFilter) return false;
      if (!normalizedKeyword) return true;

      const text = `${option.name} ${option.sourceLabel} ${option.category} ${option.description} ${option.bestFor}`.toLowerCase();
      return text.includes(normalizedKeyword);
    });
  }, [activeFilter, keyword]);

  const previewOption = previewTemplateKey ? getCVTemplateOptionByKey(previewTemplateKey) : null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-3xl font-black tracking-tight text-[#14384c]">Danh sách CV xin việc</h3>
        <p className="mt-2 text-sm text-[#567082]">Mỗi mẫu được tối ưu theo nhóm ngành nghề. Chọn mẫu phù hợp rồi xem trước chi tiết trước khi dùng.</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('featured')}
            className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-4 text-xs font-bold uppercase transition ${
              activeFilter === 'featured'
                ? 'border-[#5bb8e8] bg-[#5bb8e8] text-white shadow-[0_8px_18px_rgba(91,184,232,0.28)]'
                : 'border-[#b7dff2] bg-white text-[#256586] hover:bg-[#edf8fe]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Mẫu CV nổi bật
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-4 text-xs font-bold uppercase transition ${
              activeFilter === 'all'
                ? 'border-[#5bb8e8] bg-[#5bb8e8] text-white shadow-[0_8px_18px_rgba(91,184,232,0.28)]'
                : 'border-[#b7dff2] bg-white text-[#256586] hover:bg-[#edf8fe]'
            }`}
          >
            Xem tất cả mẫu CV
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('popular')}
            className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-4 text-xs font-bold uppercase transition ${
              activeFilter === 'popular'
                ? 'border-[#5bb8e8] bg-[#5bb8e8] text-white shadow-[0_8px_18px_rgba(91,184,232,0.28)]'
                : 'border-[#b7dff2] bg-white text-[#256586] hover:bg-[#edf8fe]'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            Mẫu CV sử dụng nhiều
          </button>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm theo ngành nghề"
            className="h-11 w-full rounded-xl border border-[#b7dff2] bg-white pl-9 pr-3 text-sm text-[#35586b] outline-none transition focus:border-[#5bb8e8]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredOptions.map((option) => {
          const isSelected = option.key === selectedTemplateKey;
          const isRecommended = option.key === recommendedTemplateKey;

          return (
            <div
              key={option.key}
              onClick={() => {
                setPreviewLanguage('vi');
                setPreviewAccentColor(undefined);
                setPreviewAvatarUrl(undefined);
                setPreviewTemplateKey(option.key);
              }}
              className={`group cursor-pointer text-left rounded-3xl border bg-white p-4 transition-all ${
                isSelected
                  ? 'border-[#5bb8e8] shadow-[0_16px_30px_rgba(91,184,232,0.25)]'
                  : 'border-[#d9ecf7] shadow-[0_10px_25px_rgba(20,56,76,0.1)] hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(20,56,76,0.16)]'
              }`}
            >
              <div className="relative overflow-hidden rounded-2xl border border-[#e3f1f9] bg-[#f4fbff]">
                <div className="h-[240px] p-3">
                  <TemplateThumbnail option={option} />
                </div>

                <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
                  {option.featured && (
                    <span className="rounded-full border border-[#bee3f4] bg-[#e9f6fd] px-2 py-0.5 text-[10px] font-semibold text-[#2c6e8f]">Nổi bật</span>
                  )}
                  {option.popular && (
                    <span className="rounded-full border border-[#cdebdc] bg-[#edf9f3] px-2 py-0.5 text-[10px] font-semibold text-[#2f7758]">Dùng nhiều</span>
                  )}
                  {isRecommended && (
                    <span className="rounded-full border border-[#f5dfb4] bg-[#fff7e8] px-2 py-0.5 text-[10px] font-semibold text-[#9a6200]">Phù hợp với bạn</span>
                  )}
                </div>

                <div className="absolute inset-0 hidden items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 md:flex">
                  <div className="flex w-full max-w-[260px] flex-col gap-2 px-4">
                    <Button
                      type="button"
                      className="h-10 border border-white/70 bg-white/95 text-[#215975] hover:bg-white"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPreviewLanguage('vi');
                        setPreviewAccentColor(undefined);
                        setPreviewAvatarUrl(undefined);
                        setPreviewTemplateKey(option.key);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      Xem trước CV
                    </Button>
                    <Button
                      type="button"
                      className="h-10 bg-[#5bb8e8] text-white hover:bg-[#4ca9d8]"
                      onClick={(event) => {
                        event.stopPropagation();
                        applyTemplate(option.key);
                      }}
                    >
                      <Check className="h-4 w-4" />
                      Dùng mẫu này
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pb-1 pt-4">
                <p className="inline-flex items-center gap-1 text-sm text-[#4f6a7a]">
                  <MapPin className="h-4 w-4 text-[#5bb8e8]" />
                  {option.category}
                </p>
                <h4 className="mt-2 text-2xl leading-tight font-extrabold tracking-tight text-[#12364a]">
                  {option.name}
                </h4>
                <p className="mt-2 text-sm text-[#5f7685]">{option.description}</p>

                <div className="mt-4 flex items-center justify-between gap-2 md:hidden">
                  <Button
                    type="button"
                    className="h-9 flex-1 border border-[#a9d8ef] bg-white text-[#215975] hover:bg-[#edf8fe]"
                    onClick={(event) => {
                      event.stopPropagation();
                      setPreviewLanguage('vi');
                      setPreviewAccentColor(undefined);
                      setPreviewAvatarUrl(undefined);
                      setPreviewTemplateKey(option.key);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    Xem trước
                  </Button>
                  <Button
                    type="button"
                    className="h-9 flex-1 bg-[#5bb8e8] text-white hover:bg-[#4ca9d8]"
                    onClick={(event) => {
                      event.stopPropagation();
                      applyTemplate(option.key);
                    }}
                  >
                    <Check className="h-4 w-4" />
                    Dùng mẫu
                  </Button>
                </div>

                {isSelected && <p className="mt-3 text-sm font-semibold text-[#2f7597]">Đang sử dụng mẫu này</p>}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOptions.length === 0 && (
        <div className="rounded-xl border border-dashed border-[#c8e5f4] bg-[#f3fafe] py-8 text-center text-sm text-[#5f7685]">
          Không tìm thấy mẫu phù hợp với từ khóa hiện tại.
        </div>
      )}

      <Dialog
        open={Boolean(previewOption)}
        onOpenChange={(open) => { if (!open) setPreviewTemplateKey(null); }}
        containerClassName="w-[96vw] h-[94vh] max-w-none max-h-none"
      >
        <DialogContent className="h-full w-full max-w-none max-h-none overflow-hidden bg-gradient-to-br from-[#0f3e57] via-[#2b7398] to-[#7dc7eb] p-0" onClose={() => setPreviewTemplateKey(null)}>
          {previewOption && (
            <div className="grid h-full min-h-0 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:p-6">
              <div className="min-h-0 overflow-auto rounded-xl bg-white p-2">
                <CVPreview
                  data={{
                    ...getPreviewDataByTemplate(previewOption.key),
                    avatarUrl: previewAvatarUrl,
                  }}
                  templateKey={previewOption.key}
                  language={previewLanguage}
                  accentColor={previewAccentColor}
                  showDownloadButton={false}
                />
              </div>

              <div className="min-h-0 overflow-auto rounded-xl bg-white/14 p-4 text-white backdrop-blur-sm">
                <h4 className="text-xl font-semibold">{previewOption.name}</h4>
                <p className="mt-1 text-sm text-sky-100">{previewOption.sourceLabel}</p>

                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Ảnh đại diện</p>
                    <input
                      ref={previewAvatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/')) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') {
                            setPreviewAvatarUrl(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
                        {previewAvatarUrl ? (
                          <img src={previewAvatarUrl} alt="Preview avatar" className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle2 className="h-6 w-6 text-white/70" />
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                        onClick={() => previewAvatarInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        Tải ảnh
                      </Button>
                      {previewAvatarUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                          onClick={() => setPreviewAvatarUrl(undefined)}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">Ngôn ngữ</p>
                    <select
                      value={previewLanguage}
                      onChange={(event) => setPreviewLanguage(event.target.value as 'vi' | 'en')}
                      className="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
                    >
                      <option className="text-gray-900" value="vi">Tiếng Việt</option>
                      <option className="text-gray-900" value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <p className="font-medium">Phong cách</p>
                    <div className="mt-1 rounded-md border border-white/20 bg-white/10 px-3 py-2">{previewOption.category}</div>
                  </div>
                  <div>
                    <p className="font-medium">Màu template</p>
                    <div className="mt-2 flex gap-2">
                      {previewColorOptions.map((color) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => setPreviewAccentColor(color)}
                          className={`h-8 w-8 rounded border ${previewAccentColor === color ? 'border-white ring-2 ring-white/70' : 'border-white/30'}`}
                          style={{ backgroundColor: color }}
                          title={`Màu ${color}`}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={() => setPreviewAccentColor(undefined)}
                        className="h-8 rounded border border-white/30 px-2 text-xs text-white hover:bg-white/10"
                      >
                        Mặc định
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <Button
                    type="button"
                    className="flex-1 bg-[#5bb8e8] text-white hover:bg-[#4ca9d8]"
                    onClick={() => {
                      applyTemplate(previewOption.key);
                      setPreviewTemplateKey(null);
                    }}
                  >
                    Dùng mẫu này
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                    onClick={() => setPreviewTemplateKey(null)}
                  >
                    Thoát
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
