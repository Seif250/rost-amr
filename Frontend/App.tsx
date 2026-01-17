import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { PurchasesExpensesPage } from './pages/PurchasesExpensesPage';
import { DailyOrdersPage } from './pages/DailyOrdersPage';
import DailySummaryPage from './pages/DailySummaryPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="size-full" dir="rtl">
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/menu-management" element={<MenuManagementPage />} />
            <Route path="/purchases-expenses" element={<PurchasesExpensesPage />} />
            <Route path="/daily-orders" element={<DailyOrdersPage />} />
            <Route path="/daily-summary" element={<DailySummaryPage />} />
          </Routes>
        </Layout>
        <Toaster position="top-center" richColors dir="rtl" />
      </div>
    </BrowserRouter>
  );
}