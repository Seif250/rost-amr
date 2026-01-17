import { Award, Leaf, Flame, Sparkles } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="bg-background">
      {/* 1️⃣ سكشن: من نحن - مع صورة خلفية */}
      <section className="relative py-20 sm:py-28 md:py-36 text-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://res.cloudinary.com/dy5jerznd/image/upload/v1768590015/Blog-Grilling-L_hnc3gz.jpg)',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="mb-3 sm:mb-4 text-4xl sm:text-5xl md:text-6xl text-white font-bold font-amiri drop-shadow-lg">
            من نحن
          </h1>
          <div className="w-16 sm:w-20 h-1 bg-primary mx-auto mb-4 sm:mb-6" />
          <p className="text-base sm:text-lg text-white/90 max-w-xl mx-auto leading-relaxed px-2 drop-shadow">
            قصة شغف بالشواء الأصيل والجودة العالية
          </p>
        </div>
      </section>

      {/* 2️⃣ سكشن: قصتنا - مع الكاركتر */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Right - Character (RTL) */}
              <div className="order-2 lg:order-1 flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl" />
                  <img
                    src="https://res.cloudinary.com/dy5jerznd/image/upload/v1768590801/1-Photoroom_vayt3v.png"
                    alt="ابن حلال"
                    className="relative w-48 sm:w-64 md:w-full max-w-xs h-auto drop-shadow-xl"
                  />
                </div>
              </div>
              
              {/* Left - Text */}
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-8 text-secondary font-bold font-amiri text-center lg:text-right">قصتنا</h2>
                <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed sm:leading-loose">
                  <p>
                    بدأت رحلة "ابن حلال" من شغف عميق بفن الشواء على الفحم الأصيل. منذ تأسيسنا،
                    كان هدفنا الأول والأخير هو تقديم أفضل تجربة طعام لعملائنا الكرام.
                  </p>
                  <p>
                    نؤمن بأن الشواء على الفحم الطبيعي ليس مجرد طريقة للطهي، بل هو فن
                    يتطلب خبرة ومهارة وصبراً. لذلك نحرص على استخدام أجود أنواع الفحم
                    الطبيعي وأفضل اللحوم والخضروات الطازجة.
                  </p>
                  <p>
                    كل يوم نستيقظ مع شغف تقديم أفضل ما لدينا، من اختيار المكونات إلى لحظة
                    تقديم الطبق على مائدتكم.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3️⃣ سكشن: فلسفتنا - لون مختلف */}
      <section className="py-12 sm:py-16 md:py-24" style={{ backgroundColor: '#F5EADF' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-8 text-secondary font-bold font-amiri">فلسفتنا في الشواء</h2>
            <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed sm:leading-loose px-2">
              <p>
                نعتمد في مطعمنا على الطرق التقليدية الأصيلة في الشواء. كل قطعة لحم
                تُشوى على الفحم الطبيعي بعناية فائقة لضمان الحصول على النكهة المميزة
                والطعم الذي لا يُنسى.
              </p>
              <p>
                الفحم الطبيعي يمنح الطعام نكهة مدخنة خاصة لا يمكن تحقيقها بأي وسيلة
                طهي أخرى. نحن نحترم هذا التقليد ونحرص على تقديمه بأفضل صورة ممكنة.
              </p>
              <p>
                كل صنف في قائمتنا يمر بعملية تحضير دقيقة، من اختيار اللحم إلى التتبيل
                بالبهارات الخاصة، ثم الشواء على درجة الحرارة المثالية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ سكشن: التزامنا بالجودة - Icons فقط */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl mb-8 sm:mb-12 text-center text-secondary font-bold font-amiri">التزامنا بالجودة</h2>
            <p className="text-center text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
              الجودة هي أساس كل ما نقدمه. نلتزم بأعلى معايير النظافة والسلامة الغذائية.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {/* Item 1 */}
              <div className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h4 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-secondary">لحوم طازجة يومياً</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">
                  نختار أفضل أنواع اللحوم من مصادر موثوقة
                </p>
              </div>

              {/* Item 2 */}
              <div className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h4 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-secondary">خضروات طازجة</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">
                  خضروات مختارة بعناية من المزارع المحلية
                </p>
              </div>

              {/* Item 3 */}
              <div className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h4 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-secondary">فحم طبيعي 100%</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">
                  فحم طبيعي خالٍ من المواد الكيميائية
                </p>
              </div>

              {/* Item 4 */}
              <div className="text-center p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <h4 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 text-secondary">تتبيلات خاصة</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed hidden sm:block">
                  بهارات وتتبيلات محضرة يومياً
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ سكشن: CTA - لون غامق */}
      <section className="py-12 sm:py-16 md:py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-3 sm:mb-4 text-2xl sm:text-3xl md:text-4xl text-white font-bold font-amiri">نتطلع لخدمتكم</h2>
          <div className="w-12 sm:w-16 h-1 bg-primary mx-auto mb-4 sm:mb-6" />
          <p className="text-sm sm:text-lg mb-8 sm:mb-10 max-w-lg mx-auto text-white/80 px-2">
            تفضلوا بزيارتنا وتذوقوا أشهى المشويات على الفحم الطبيعي
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <a
              href="/menu"
              className="w-full sm:w-auto inline-block px-8 py-3 sm:py-4 bg-primary text-white hover:bg-primary/90 transition-all text-base font-medium min-h-[48px]"
            >
              تصفح القائمة
            </a>
            <a
              href="/contact"
              className="w-full sm:w-auto inline-block px-8 py-3 sm:py-4 bg-transparent border-2 border-white/80 text-white hover:bg-white hover:text-secondary transition-all text-base min-h-[48px]"
            >
              اتصل بنا
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}