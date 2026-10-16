import { Sparkles, FileSearch, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const aiFeatures = [
  {
    icon: FileSearch,
    title: 'Match CV với các công việc phù hợp',
    description: 'Hệ thống AI thông minh sẽ phân tích CV của bạn và tự động gợi ý những công việc phù hợp nhất dựa trên kỹ năng, kinh nghiệm và sở thích của bạn.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: MessageSquare,
    title: 'Nhận xét CV để đề xuất cách điều chỉnh',
    description: 'Nhận được phản hồi chi tiết về CV của bạn từ AI, bao gồm các đề xuất cải thiện để tăng cơ hội được nhà tuyển dụng chú ý.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    icon: Sparkles,
    title: 'Tối ưu hóa hồ sơ ứng tuyển',
    description: 'AI sẽ giúp bạn tối ưu hóa hồ sơ ứng tuyển của mình, đảm bảo bạn nổi bật trong mắt nhà tuyển dụng và tăng tỷ lệ được mời phỏng vấn.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  }
];

export function AIFeaturesSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tính năng AI thông minh
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá sức mạnh của trí tuệ nhân tạo trong việc tìm kiếm và phát triển sự nghiệp của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {aiFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="text-gray-700 font-medium">
              Powered by AI Technology
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
