import { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { menuApi, type MenuItem } from '../services/api';

// Category mapping for Arabic display
const CATEGORIES = {
  'appetizers': 'مقبلات',
  'main-dishes': 'أطباق رئيسية',
  'grills': 'مشويات',
  'desserts': 'حلويات',
  'drinks': 'مشروبات',
} as const;

export function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await menuApi.getAll({ available: true });
      setMenuItems(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحميل القائمة');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Group items by category
  const groupedItems = menuItems.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
    const categoryLabel = CATEGORIES[item.category as keyof typeof CATEGORIES] || item.category || 'أخرى';
    if (!acc[categoryLabel]) {
      acc[categoryLabel] = [];
    }
    acc[categoryLabel].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  if (isLoading) {
    return (
      <div className="py-24 bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">جاري تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-3">{error}</p>
          <button 
            onClick={fetchMenuItems}
            className="px-5 py-2 bg-primary text-white hover:bg-primary/90 transition-all text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Page Header with Background Image */}
      <div className="relative py-12 sm:py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://res.cloudinary.com/dy5jerznd/image/upload/v1768590015/Blog-Grilling-L_hnc3gz.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl text-white font-bold font-amiri mb-2 sm:mb-3 drop-shadow-lg">
            قائمة الطعام
          </h1>
          <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto drop-shadow-md px-4">
            جميع أصنافنا مشوية على الفحم الطبيعي بعناية فائقة
          </p>
        </div>
      </div>

      {/* Menu Section */}
      <section className="py-8 sm:py-12 md:py-16" style={{ background: 'linear-gradient(to left, #FFF7ED, #F3E6D8)' }}>
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl">

          {/* Menu Content */}
          {menuItems.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block">🍽️</span>
              <p className="text-xl text-muted-foreground mb-2">قريباً</p>
              <p className="text-muted-foreground text-sm">جاري تحديث القائمة...</p>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-12">
              {(Object.entries(groupedItems) as [string, MenuItem[]][]).map(([category, items]) => (
                // Skip categories with less than 1 item
                items.length > 0 && (
                  <div key={category}>
                    {/* Block 2: Category Header */}
                    <div className="mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl md:text-2xl text-secondary font-semibold inline-block">
                        {category}
                      </h2>
                      <div className="w-10 sm:w-12 h-0.5 bg-primary mt-2" />
                    </div>

                    {/* Block 3: Items Grid */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                      {items.map((item: MenuItem) => (
                        <div
                          key={item._id}
                          className="bg-white border border-border hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group flex flex-col"
                        >
                          {/* Card Image */}
                          {item.image && (
                            <div className="aspect-[4/3] overflow-hidden bg-muted">
                              <img
                                src={item.image}
                                alt={item.nameAr}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          
                          {/* Card Content */}
                          <div className="p-3 sm:p-4 flex flex-col flex-1">
                            <h3 className="text-sm sm:text-base font-semibold mb-1 text-secondary line-clamp-2">{item.nameAr}</h3>
                            {item.descriptionAr && (
                              <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 flex-1">
                                {item.descriptionAr}
                              </p>
                            )}
                            
                            {/* Price & CTA */}
                            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/50 gap-2">
                              <span className="text-base sm:text-lg font-bold text-primary">
                                {item.price} جنيه
                              </span>
                              <button className="px-2 sm:px-3 py-1.5 sm:py-2 bg-primary/10 text-primary text-xs sm:text-sm hover:bg-primary hover:text-white transition-colors min-h-[36px] sm:min-h-[40px]">
                                أضف للطلب
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - منفصل وبسيط */}
      <section className="py-10 sm:py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 text-white font-semibold">للطلب أو الاستفسار</h2>
          <p className="text-white/60 mb-5 sm:mb-6 max-w-sm mx-auto text-sm">
            فريقنا جاهز لخدمتكم
          </p>
          <a
            href="tel:+201012345678"
            className="inline-block w-full sm:w-auto px-8 py-3 sm:py-4 bg-primary text-white hover:bg-primary/80 transition-all text-base font-medium min-h-[48px]"
          >
            اتصل الآن
          </a>
        </div>
      </section>
    </div>
  );
}
