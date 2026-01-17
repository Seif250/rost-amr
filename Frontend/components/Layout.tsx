import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const publicLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/menu', label: 'القائمة' },
    { to: '/about', label: 'من نحن' },
    { to: '/contact', label: 'اتصل بنا' },
  ];

  const internalLinks = [
    { to: '/menu-management', label: 'إدارة الأصناف' },
    { to: '/purchases-expenses', label: 'المشتريات والمصروفات' },
    { to: '/daily-orders', label: 'الطلبات اليومية' },
    { to: '/daily-summary', label: 'ملخص المبيعات' },
  ];

  const isInternalPage = location.pathname.startsWith('/menu-management') ||
                          location.pathname.startsWith('/purchases-expenses') || 
                          location.pathname.startsWith('/daily-orders') ||
                          location.pathname.startsWith('/daily-summary');

  const currentLinks = isInternalPage ? internalLinks : publicLinks;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b-2 border-primary/20 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-20 md:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img 
                src="https://res.cloudinary.com/dy5jerznd/image/upload/v1768607521/image_2026-01-17_015034983-Photoroom_o8vmmm.png" 
                alt="ابن حلال"
                className="w-auto object-contain"
                style={{ height: '9rem' }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6 items-center">
              {currentLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-base font-medium transition-all duration-200 relative py-2 ${
                    location.pathname === link.to
                      ? 'text-primary font-bold'
                      : 'text-secondary/80 hover:text-primary'
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-0.5 right-0 h-[3px] bg-primary rounded-full transition-all duration-200 ${
                    location.pathname === link.to ? 'w-full' : 'w-0 hover:w-full'
                  }`} />
                </Link>
              ))}
              
              {/* CTA Button */}
              {!isInternalPage && (
                <Link
                  to="/contact"
                  className="mr-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold hover:bg-primary/90 hover:shadow-md transition-all duration-200"
                >
                  اطلب الآن
                </Link>
              )}
              
              {!isInternalPage && (
                <Link
                  to="/menu-management"
                  className="text-xs text-secondary/50 hover:text-primary transition-colors border-r border-border/50 pr-4"
                >
                  لوحة التحكم
                </Link>
              )}
              {isInternalPage && (
                <Link
                  to="/"
                  className="text-xs text-secondary/50 hover:text-primary transition-colors border-r border-border/50 pr-4"
                >
                  الموقع العام
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-muted rounded-lg transition-colors"
              aria-label="فتح القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t border-border absolute top-full left-0 right-0 bg-white shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="flex flex-col">
                {currentLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-5 py-4 text-base font-medium transition-colors min-h-[52px] flex items-center active:bg-muted ${
                      location.pathname === link.to
                        ? 'text-primary bg-primary/5 border-r-4 border-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-2 mx-4" />
                {!isInternalPage && (
                  <Link
                    to="/menu-management"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-5 py-4 text-muted-foreground hover:bg-muted transition-colors min-h-[52px] flex items-center active:bg-muted"
                  >
                    لوحة التحكم
                  </Link>
                )}
                {isInternalPage && (
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-5 py-4 text-muted-foreground hover:bg-muted transition-colors min-h-[52px] flex items-center active:bg-muted"
                  >
                    الموقع العام
                  </Link>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Only show on public pages */}
      {!isInternalPage && (
        <footer className="bg-secondary text-white mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16 mb-8 sm:mb-12">
            {/* About */}
            <div className="md:pr-8">
              <h4 className="text-2xl mb-4 text-white font-bold" style={{ fontFamily: 'Amiri, serif' }}>
                ابن حلال
              </h4>
              <p className="text-white/60 leading-relaxed max-w-xs">
                أشهى المشويات على الفحم الطبيعي بأعلى معايير الجودة
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl mb-4 text-white font-semibold">روابط سريعة</h4>
              <div className="space-y-3">
                <Link to="/menu" className="block text-white/50 hover:text-primary hover:underline underline-offset-4 transition-all duration-200">
                  القائمة
                </Link>
                <Link to="/about" className="block text-white/50 hover:text-primary hover:underline underline-offset-4 transition-all duration-200">
                  من نحن
                </Link>
                <Link to="/contact" className="block text-white/50 hover:text-primary hover:underline underline-offset-4 transition-all duration-200">
                  اتصل بنا
                </Link>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-xl mb-4 text-white font-semibold">تواصل معنا</h4>
              <div className="space-y-3 text-white/60">
                <p className="flex items-center gap-3" dir="ltr">
                  <Phone className="w-4 h-4 text-primary" />
                  +20 101 234 5678
                </p>
                <p className="flex items-center gap-3" dir="ltr">
                  <Mail className="w-4 h-4 text-primary" />
                  info@ebnhalal.com
                </p>
                <p className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  القاهرة، مصر
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center text-white/40 text-sm">
            <p>© 2026 ابن حلال. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}