import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const publicPages = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'menu', label: 'قائمة الطعام' },
    { id: 'about', label: 'من نحن' },
    { id: 'contact', label: 'اتصل بنا' },
  ];

  const internalPages = [
    { id: 'store-operations', label: 'عمليات المتجر' },
    { id: 'daily-orders', label: 'طلبات اليوم' },
    { id: 'daily-summary', label: 'ملخص المبيعات' },
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigation('home')}
            className="text-xl font-semibold text-primary"
          >
            مطعم الفحم
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-reverse space-x-8">
            {publicPages.map((page) => (
              <button
                key={page.id}
                onClick={() => handleNavigation(page.id)}
                className={`px-3 py-2 rounded-md transition-colors ${
                  currentPage === page.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent'
                }`}
              >
                {page.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-accent"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <div className="border-b border-border pb-2 mb-2">
              <p className="text-xs text-muted-foreground px-3 py-2">صفحات عامة</p>
              {publicPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleNavigation(page.id)}
                  className={`w-full text-right px-3 py-2 rounded-md transition-colors ${
                    currentPage === page.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground px-3 py-2">صفحات داخلية</p>
              {internalPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleNavigation(page.id)}
                  className={`w-full text-right px-3 py-2 rounded-md transition-colors ${
                    currentPage === page.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
