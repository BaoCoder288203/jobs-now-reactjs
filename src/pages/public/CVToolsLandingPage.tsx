import { Link, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare, Sparkles, Target } from 'lucide-react';

type CvToolMode = 'tao-cv' | 'chuan-hoa-cv';

function getModeFromPathname(pathname: string): CvToolMode {
  return pathname.includes('/tools/chuan-hoa-cv') ? 'chuan-hoa-cv' : 'tao-cv';
}

export function CVToolsLandingPage() {
  const { pathname } = useLocation();
  const mode = getModeFromPathname(pathname);

  const heroTitle =
    mode === 'chuan-hoa-cv'
      ? 'Chuẩn hóa CV với JobsNow'
      : 'Tạo CV online định dạng chuẩn với JobsNow';
  const heroSub =
    mode === 'chuan-hoa-cv'
      ? 'Chuyển đổi CV hiện có của bạn về định dạng chuẩn ATS, thân thiện nhà tuyển dụng.'
      : 'Xây dựng sự nghiệp với công cụ tạo CV chuyên nghiệp—chỉ vài phút, CV định dạng chuẩn, thân thiện ATS.';
  const ctaLabel = mode === 'chuan-hoa-cv' ? 'Chuẩn hóa CV ngay' : 'Tạo CV ngay';
  const primaryCtaHref = mode === 'chuan-hoa-cv' ? '/tools/chuan-hoa-cv/analyze' : '/tools/tao-cv/builder';

  const cvSections = [
    {
      title: 'Thao tác đơn giản, tiện lợi',
      subtitle:
        'Cấu trúc CV chuẩn, các trường thông tin được chọn lọc sẵn, giúp bạn dễ dàng nhập thông tin cần thiết.',
      bullets: [
        'Tiết kiệm thời gian chọn & thiết kế cách trình bày CV.',
        'Ưu tiên cho chất lượng nội dung chính trong CV.',
        'Gây ấn tượng với Nhà tuyển dụng bằng Kinh nghiệm làm việc & Kỹ năng.',
        'Tạo điểm nhấn với các phần: Dự án, Sở thích, Hoạt động, Ngôn ngữ, Người tham vấn, Chứng chỉ, Giải thưởng…',
      ],
      imageUrl: 'https://c.topdevvn.com/v4/assets/images/create-cv-online/make-a-cv.png',
      reverse: false,
    },
    {
      title: 'Thông tin đồng bộ, sử dụng trên mọi nền tảng',
      subtitle:
        'Thông tin trên JobsNow CV được cập nhật đầy đủ, chính xác và đồng bộ trên cả PC và mobile.',
      bullets: [
        'Sau khi đăng nhập, bạn có thể tạo CV với thông tin được điền tự động từ hồ sơ JobsNow.',
        'Dễ dàng cập nhật kinh nghiệm mới và dùng ngay để tìm việc.',
        'Đồng bộ file trên cả PC & Mobile, quản lý CV ở mọi nơi.',
        'Tạo và chỉnh sửa CV hỗ trợ tốt trên web; các tính năng quản lý & đồng bộ tối ưu cho đa nền tảng.',
      ],
      imageUrl: '/images/82a6bdb3-6594-4b45-ad24-3074d9323763.png',
      reverse: true,
    },
    {
      title: 'Ứng tuyển việc làm mọi nơi',
      subtitle:
        'Hoàn thành JobsNow CV một lần, sử dụng linh hoạt cho nhiều kênh ứng tuyển.',
      bullets: [
        'Ứng tuyển việc làm trực tiếp trên JobsNow chỉ với vài cú click.',
        'Quản lý lịch sử ứng tuyển và các phiên bản CV đã dùng.',
        'Theo dõi quá trình xử lý hồ sơ cho từng vị trí.',
        'Hỗ trợ lưu trữ file CV tải lên và tải về dưới dạng PDF.',
      ],
      imageUrl: '/images/list-cv.png',
      reverse: false,
    },
  ] as const;

  const aiFeatures = [
    {
      title: 'Match CV với các công việc phù hợp',
      desc: 'AI phân tích CV và gợi ý các công việc phù hợp nhất dựa trên kỹ năng và kinh nghiệm của bạn.',
      icon: Target,
    },
    {
      title: 'Nhận xét CV',
      desc: 'Nhận phản hồi chi tiết từ AI về điểm mạnh/điểm cần cải thiện theo góc nhìn nhà tuyển dụng.',
      icon: MessageSquare,
    },
    {
      title: 'Đề xuất sửa',
      desc: 'AI đưa ra gợi ý chỉnh sửa cụ thể để CV nổi bật hơn và tăng tỷ lệ được mời phỏng vấn.',
      icon: Sparkles,
    },
  ] as const;

  return (
    <AppLayout>
      <div className="min-h-screen">
        <section className="relative mx-auto px-4 py-16 text-center min-h-[35vh] sm:min-h-[40vh] md:min-h-[50vh] lg:min-h-[60vh] xl:min-h-[65vh]">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[100%] h-full overflow-hidden rounded-b-[2rem] z-0"
            aria-hidden
          >
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#4053ff] from-[5%] to-gray-50 to-[70%]"
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage: `linear-gradient(to right, #f7f7f72d 1px, transparent 1px), linear-gradient(to bottom, #f7f7f72d 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }}
              aria-hidden
            />
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl lg:text-5xl md:text-4xl font-bold text-gray-900 mb-4">{heroTitle}</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">{heroSub}</p>
            <div className="flex items-center justify-center gap-3">
              <Button asChild className="bg-primary hover:bg-white hover:text-primary border border-primary text-white text-lg py-6 px-5">
                <Link to={primaryCtaHref}>{ctaLabel}</Link>
              </Button>
            <Button asChild variant="outline" className="bg-primary hover:bg-white hover:text-primary border border-primary text-white text-lg py-6 px-5">
              <Link to="/jobs">Khám phá việc làm</Link>
            </Button>
          </div>
        </div>

          <div
            className="absolute bottom-0 top-2/3 xl:top-5/8 lg:top-2/3 md:top-3/4 sm:top-4/6 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-[90%] sm:w-[80%] max-w-7xl h-[45vh] sm:h-[50vh] md:h-[55vh] min-h-[200px] sm:min-h-[240px] rounded-2xl sm:rounded-2xl overflow-hidden bg-no-repeat bg-bottom bg-contain"
            style={{ backgroundImage: "url('/images/thumbnail-ai.jpeg')" }}
            role="img"
            aria-label="CV Tools"
          />
        </section>

        <section className="container mx-auto px-4 pb-14 space-y-16 mt-[20rem] xl:mt-[17rem] lg:mt-[19rem] md:mt-[23rem] sm:mt-[20rem]">
          {cvSections.map((sec, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center gap-8 md:gap-12 ${
                sec.reverse ? 'md:flex-row-reverse' : 'md:flex-row'
              }`}
            >
              {/* Text */}
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {sec.title}
                </h2>
                <p className="text-gray-600 mb-4">{sec.subtitle}</p>
                <ul className="space-y-2 text-gray-700 text-sm md:text-base list-disc list-inside">
                  {sec.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              {/* Image placeholder */}
              <div className="flex-1 flex items-center justify-center">
                {
                  sec.imageUrl ? (
                    <img src={sec.imageUrl} alt="CV Tools" className="w-100 h-full object-contain" />
                  ) : (
                    <div className="w-full max-w-md aspect-video rounded-2xl bg-gradient-to-br from-primary/10 to-primary-light/20 border border-primary/20 flex items-center justify-center text-sm text-gray-500 text-center px-4">
                      Hình minh hoạ cho tính năng CV
                    </div>
                  )
                }
              </div>
            </div>
          ))}
        </section>

        {/* Section AI cuối cùng */}
        <section className="py-14 bg-white border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                AI giúp CV của bạn tốt hơn như thế nào?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                JobsNow AI phân tích CV, gợi ý công việc phù hợp và đề xuất chỉnh sửa chi tiết để bạn luôn
                nổi bật trước nhà tuyển dụng.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {aiFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Card key={i} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-14 h-14 bg-primary/15 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-gray-700 font-medium">Powered by JobsNow AI</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA + Back */}
        <section className="bg-gray-50 container mx-auto p-4 pb-16 text-center">
          <Link to="/" className="text-primary hover:underline font-medium">
            ← Về trang chủ
          </Link>
        </section>
      </div>
    </AppLayout>
  );
}

