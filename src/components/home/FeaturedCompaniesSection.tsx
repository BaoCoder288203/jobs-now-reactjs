import { FEATURED_COMPANY_LOGOS } from '@/constants/featuredCompanies';

export function FeaturedCompaniesSection() {
  const logos = [...FEATURED_COMPANY_LOGOS, ...FEATURED_COMPANY_LOGOS];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/90 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-wide">
            Công ty nổi bật
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex min-w-max animate-featured-scroll gap-6 py-2">
            {logos.map((logo, i) => (
              <div
                key={`${logo.src}-${i}`}
                className="flex-shrink-0 w-40 h-24 bg-white rounded-lg shadow-md flex items-center justify-center p-4 border border-gray-100"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  className="max-h-full max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
