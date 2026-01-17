import { Phone, Mail, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="bg-background">
      {/* 1️⃣ Page Header - مع صورة خلفية */}
      <section className="relative py-16 sm:py-24 md:py-32 text-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://res.cloudinary.com/dy5jerznd/image/upload/v1768588404/igor-rodrigues-m6RdxfrLm94-unsplash_laaipg.jpg)',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60" />
        
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="mb-2 sm:mb-3 text-3xl sm:text-4xl md:text-5xl text-white font-bold font-amiri drop-shadow-lg">
            اتصل بنا
          </h1>
          <div className="w-12 sm:w-16 h-1 bg-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-white/90 max-w-md mx-auto px-2 drop-shadow">
            نحن هنا للإجابة على استفساراتكم وخدمتكم
          </p>
        </div>
      </section>

      {/* 2️⃣ Contact Cards - Grid 2x2 */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Phone Card */}
              <div className="p-4 sm:p-6 rounded-lg" style={{ backgroundColor: '#FBF3EA' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-secondary">الهاتف</h3>
                    <a
                      href="tel:+201012345678"
                      className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors mb-1"
                      dir="ltr"
                    >
                      +20 101 234 5678
                    </a>
                    <a
                      href="tel:+201098765432"
                      className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                      dir="ltr"
                    >
                      +20 109 876 5432
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="p-4 sm:p-6 rounded-lg" style={{ backgroundColor: '#FBF3EA' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-secondary">البريد الإلكتروني</h3>
                    <a
                      href="mailto:info@ibnhalal.com"
                      className="block text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors"
                      dir="ltr"
                    >
                      info@ibnhalal.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Working Hours Card */}
              <div className="p-4 sm:p-6 rounded-lg" style={{ backgroundColor: '#FBF3EA' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-secondary">ساعات العمل</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">السبت - الخميس: 12 ظهراً - 12 منتصف الليل</p>
                    <p className="text-muted-foreground text-xs sm:text-sm">الجمعة: 1 ظهراً - 12 منتصف الليل</p>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="p-4 sm:p-6 rounded-lg" style={{ backgroundColor: '#FBF3EA' }}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 text-secondary">العنوان</h3>
                    <address className="text-muted-foreground not-italic text-xs sm:text-sm leading-relaxed">
                      شارع التحرير، القاهرة، مصر
                    </address>
                  </div>
                </div>
              </div>
            </div>

            {/* 3️⃣ Quick Actions */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href="tel:+201012345678"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-all text-sm font-medium min-h-[48px]"
              >
                <Phone className="w-4 h-4" />
                اتصل الآن
              </a>
              <a
                href="https://wa.me/201012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white hover:bg-green-700 transition-all text-sm font-medium min-h-[48px]"
              >
                <MessageCircle className="w-4 h-4" />
                واتساب
              </a>
              <a
                href="https://maps.app.goo.gl/mepsRud7oiesg5k97"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white hover:bg-secondary/90 transition-all text-sm font-medium min-h-[48px]"
              >
                <ExternalLink className="w-4 h-4" />
                افتح في Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4️⃣ Map Section */}
      <section className="py-10 sm:py-12 md:py-16" style={{ backgroundColor: '#FBF3EA' }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-secondary text-center mb-4 sm:mb-6 font-amiri">موقعنا</h2>
            <div className="rounded-lg overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1597.7044891917221!2d31.175979775461805!3d29.966713825525712!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjnCsDU4JzAwLjAiTiAzMcKwMTAnMzMuNSJF!5e1!3m2!1sen!2seg!4v1768591365805!5m2!1sen!2seg"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="موقع ابن حلال"
                className="w-full sm:h-[300px]"
              />
            </div>
            <div className="text-center mt-3 sm:mt-4">
              <a
                href="https://maps.app.goo.gl/mepsRud7oiesg5k97"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-xs sm:text-sm inline-flex items-center gap-1"
              >
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                عرض الموقع الكامل على Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5️⃣ CTA Section - بسيط */}
      <section className="py-10 sm:py-12 md:py-16 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-2 sm:mb-3 text-xl sm:text-2xl md:text-3xl text-white font-bold font-amiri">هل تحتاج مساعدة؟</h2>
          <p className="text-white/70 mb-6 sm:mb-8 max-w-sm mx-auto text-xs sm:text-sm px-2">
            فريقنا جاهز لخدمتك على مدار الساعة
          </p>
          <a
            href="tel:+201012345678"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white hover:bg-primary/90 transition-all font-medium min-h-[48px]"
          >
            <Phone className="w-4 h-4" />
            اتصل الآن
          </a>
        </div>
      </section>
    </div>
  );
}