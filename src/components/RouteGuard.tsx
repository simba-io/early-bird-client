import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";

// Pages accessible without login
export const PUBLIC_ROUTES = ["/", "/contact", "/auth", "/about", "/contact-sales"];

// Pages accessible to logged-in but unpaid users
export const FREE_ROUTES = ["/", "/contact", "/auth", "/about", "/contact-sales", "/account"];

type Props = {
  children: ReactNode;
  requireAuth?: boolean;
  requirePaid?: boolean;
};

export function RouteGuard({ children, requireAuth = false, requirePaid = false }: Props) {
  const { user, isPaid, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-guard-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  if (requirePaid && !isPaid) {
    return <Navigate to="/account" replace />;
  }

  return <>{children}</>;
}
