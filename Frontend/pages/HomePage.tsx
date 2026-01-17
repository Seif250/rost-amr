import { Link } from 'react-router-dom';
import { Award, BadgeDollarSign, Zap, Sparkles } from 'lucide-react';
import characterImage from '../assets/faaebc032cd163b50834e2398c3f9e602add57c5.png';

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden py-8 sm:py-12">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://res.cloudinary.com/dy5jerznd/image/upload/v1768608772/400679a1-a400-4b59-9c72-4a0b5452aef9-md_oqqqou.jpg)',
          }}
        />
        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/5" />

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-center md:text-right order-2 md:order-1 max-w-xl md:max-w-none mx-auto md:mx-0">
              <div className="flex flex-col items-center md:items-end">
                <img 
                  src="https://res.cloudinary.com/dy5jerznd/image/upload/v1768607521/image_2026-01-17_015034983-Photoroom_o8vmmm.png" 
                  alt="ابن حلال"
                  className="w-auto object-contain"
                  style={{ height: '20rem' }}
                />
                <div className="w-20 sm:w-32 h-1 sm:h-1.5 bg-primary mb-5 sm:mb-8 rounded-full" />
                <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 leading-relaxed sm:leading-loose text-secondary/80 max-w-lg px-2 sm:px-0">
                  أشهى المشويات على الفحم
                  <span className="block mt-1 sm:mt-2">طعم أصيل وجودة لا تُضاهى</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center px-4 sm:px-0">
                  {/* Primary CTA */}
                  <Link
                    to="/contact"
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-primary text-white hover:bg-primary/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-lg sm:text-xl font-semibold min-w-[200px] sm:min-w-[220px] text-center min-h-[52px] flex items-center justify-center"
                  >
                    اطلب الآن
                  </Link>
                  {/* Secondary CTA */}
                  <Link
                    to="/menu"
                    className="w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 bg-transparent border-2 border-primary/60 text-primary hover:border-primary hover:bg-primary/5 transition-all duration-300 text-base sm:text-lg min-w-[180px] sm:min-w-[200px] text-center min-h-[48px] flex items-center justify-center"
                  >
                    استكشف القائمة
                  </Link>
                </div>
              </div>
            </div>

            {/* Character Image */}
            <div className="order-1 md:order-2 flex justify-center md:justify-end">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 warm-gradient rounded-full blur-2xl opacity-20 animate-pulse group-hover:opacity-40 transition-opacity duration-300" />
                <img
                  src={characterImage}
                  alt="ابن حلال"
                  className="relative w-48 sm:w-64 md:w-full max-w-sm h-auto drop-shadow-2xl transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-12 sm:py-20 md:py-32 overflow-hidden">
        {/* Embedded background effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom, 
                rgba(255,255,255,1) 0%, 
                rgba(245,235,225,0.3) 8%, 
                rgba(225,200,180,0.15) 25%,
                rgba(210,180,150,0.2) 50%,
                rgba(225,200,180,0.15) 75%,
                rgba(245,235,225,0.3) 92%,
                rgba(255,255,255,1) 100%
              )
            `
          }}
        />
        {/* Soft vignette overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 120% 60% at 50% 50%, 
                transparent 40%, 
                rgba(255,255,255,0.6) 100%
              )
            `,
            boxShadow: 'inset 0 30px 60px -30px rgba(255,255,255,0.8), inset 0 -30px 60px -30px rgba(255,255,255,0.8)'
          }}
        />
        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-6 sm:mb-8 text-3xl sm:text-4xl md:text-5xl text-secondary">
              فن الشواء على الفحم
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-primary mx-auto mb-8 sm:mb-12" />
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0">
              في "اين حلال" نقدم لك تجربة فريدة من نوعها في عالم المشويات. كل قطعة لحم
              تُشوى بعناية فائقة على الفحم الطبيعي، مع استخدام أفضل التتبيلات والبهارات
              الخاصة التي تمنحك طعماً لا يُنسى.
            </p>
            <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed px-2 sm:px-0">
              نختار أجود أنواع اللحوم الطازجة يومياً، ونحرص على تقديم وجبات شهية بأعلى
              معايير الجودة والنظافة. هدفنا أن تشعر بالسعادة مع كل قضمة!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {/* Feature 1 - تتبيلات سرية */}
          <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden group cursor-pointer">
            <img 
              src="https://res.cloudinary.com/dy5jerznd/image/upload/v1768587347/image_2026-01-16_201545566_txpy5f.png" 
              alt="تتبيلات سرية"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 font-amiri drop-shadow-lg">
                تتبيلات سرية
              </h3>
              <p className="text-white/90 text-sm sm:text-lg md:text-xl leading-relaxed max-w-xs drop-shadow-md">
                خلطات بهارات خاصة ووصفات سرية تمنح مشوياتنا طعمًا فريدًا
              </p>
            </div>
          </div>

          {/* Feature 2 - لحوم طازجة */}
          <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden group cursor-pointer">
            <img 
              src="https://res.cloudinary.com/dy5jerznd/image/upload/v1768587078/image_2026-01-16_201114977_ja2iyd.png" 
              alt="لحوم طازجة"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 font-amiri drop-shadow-lg">
                لحوم طازجة يوميًا
              </h3>
              <p className="text-white/90 text-sm sm:text-lg md:text-xl leading-relaxed max-w-xs drop-shadow-md">
                نختار أفضل أنواع اللحوم الطازجة من مصادر موثوقة
              </p>
            </div>
          </div>

          {/* Feature 3 - فحم طبيعي */}
          <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden group cursor-pointer sm:col-span-2 md:col-span-1">
            <img 
              src="https://res.cloudinary.com/dy5jerznd/image/upload/v1768586337/photo-1495951863312-2a5268b2b4b9_wsxmzh.jpg" 
              alt="فحم طبيعي"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 font-amiri drop-shadow-lg">
                فحم طبيعي 100%
              </h3>
              <p className="text-white/90 text-sm sm:text-lg md:text-xl leading-relaxed max-w-xs drop-shadow-md">
                نستخدم الفحم الطبيعي للحصول على نكهة شواء مميزة
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-12 sm:py-20 md:py-32 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Title */}
            <h2 className="text-center mb-10 sm:mb-14 md:mb-20 text-3xl sm:text-5xl md:text-6xl text-secondary font-bold font-amiri tracking-wide">
              ليه تختار "ابن حلال"؟
            </h2>
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Right Column - Reasons List */}
              <div className="order-1">
                <div className="space-y-4 sm:space-y-6">
                  {/* Reason 1 - Quality */}
                  <div className="flex gap-4 sm:gap-5 items-start group">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary/90" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-secondary">جودة لا تقبل المساومة</h4>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed sm:leading-loose max-w-sm">
                        نلتزم بأعلى معايير الجودة في كل شيء، من اختيار المكونات إلى التقديم
                      </p>
                    </div>
                  </div>

                  {/* Reason 2 - Price */}
                  <div className="flex gap-4 sm:gap-5 items-start group">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <BadgeDollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-primary/90" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-secondary">أسعار عادلة</h4>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed sm:leading-loose max-w-sm">
                        وجبات شهية بأسعار ممتازة في متناول الجميع
                      </p>
                    </div>
                  </div>

                  {/* Reason 3 - Speed */}
                  <div className="flex gap-4 sm:gap-5 items-start group">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-primary/90" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-secondary">خدمة سريعة ووديّة</h4>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed sm:leading-loose max-w-sm">
                        فريق محترف لخدمتك مع توصيل سريع لباب بيتك
                      </p>
                    </div>
                  </div>

                  {/* Reason 4 - Cleanliness */}
                  <div className="flex gap-4 sm:gap-5 items-start group">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary/90" />
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-secondary">نظافة تامة</h4>
                      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed sm:leading-loose max-w-sm">
                        أعلى معايير النظافة والسلامة الغذائية دائماً
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-10 sm:mt-14 text-center sm:text-right">
                  <Link
                    to="/menu"
                    className="inline-block w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 bg-primary text-white text-lg sm:text-xl font-semibold rounded-lg shadow-lg hover:bg-primary/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 min-h-[52px]"
                  >
                    شوف المنيو
                  </Link>
                </div>
              </div>

              {/* Left Column - Image */}
              <div className="order-2 lg:order-2">
                <div className="relative">
                  <div className="absolute -inset-3 bg-primary/5 rounded-3xl transform rotate-2" />
                  <img
                    src="https://res.cloudinary.com/dy5jerznd/image/upload/v1768587078/image_2026-01-16_201114977_ja2iyd.png"
                    alt="مشويات ابن حلال"
                    className="relative w-full h-auto rounded-2xl shadow-xl object-cover aspect-square transform -rotate-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 md:py-28 text-white relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://res.cloudinary.com/dy5jerznd/image/upload/v1768588404/igor-rodrigues-m6RdxfrLm94-unsplash_laaipg.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/60" />
        </div>
        {/* Fire Line Decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="mb-3 sm:mb-4 text-3xl sm:text-5xl md:text-6xl text-white font-bold font-amiri drop-shadow-lg">
            جرب مشوياتنا اللذيذة
          </h2>
          <div className="w-24 sm:w-32 h-1 sm:h-1.5 bg-primary mx-auto mb-5 sm:mb-6 rounded-full" />
          <p className="text-base sm:text-xl md:text-2xl mb-8 sm:mb-10 max-w-xl mx-auto text-white/80 leading-relaxed drop-shadow-md px-4">
            اكتشف قائمتنا المميزة واطلب الآن
          </p>
          <Link
            to="/menu"
            className="inline-block w-full sm:w-auto px-10 sm:px-14 py-4 sm:py-5 bg-primary text-white text-lg sm:text-xl font-semibold shadow-lg hover:bg-primary/80 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 min-h-[52px]"
          >
            تصفح القائمة
          </Link>
        </div>
      </section>
    </div>
  );
}
