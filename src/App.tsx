import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/Layout";
import { RouteGuard } from "./components/RouteGuard";
import { HomePage } from "./pages/HomePage";
import { ContactPage } from "./pages/ContactPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactSalesPage } from "./pages/ContactSalesPage";
import { AuthPage } from "./pages/AuthPage";
import { AccountPage } from "./pages/AccountPage";
import { DashboardPage } from "./pages/DashboardPage";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact-sales" element={<ContactSalesPage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Logged-in routes (free) */}
            <Route
              path="/account"
              element={
                <RouteGuard requireAuth>
                  <AccountPage />
                </RouteGuard>
              }
            />

            {/* Paid-only routes */}
            <Route
              path="/dashboard"
              element={
                <RouteGuard requireAuth requirePaid>
                  <DashboardPage />
                </RouteGuard>
              }
            />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
