import type { CSSProperties } from "react";

type DashboardStyleMap = {
  pageContainer: CSSProperties;
  card: CSSProperties;
  title: CSSProperties;
  subtitle: CSSProperties;
  emailText: CSSProperties;
  loadingText: CSSProperties;
  errorText: CSSProperties;
  statGrid: CSSProperties;
  statCard: CSSProperties;
  statLabel: CSSProperties;
  statValue: CSSProperties;
  tokensCard: CSSProperties;
  tokensLabel: CSSProperties;
  tokensBalance: CSSProperties;
  actionRow: CSSProperties;
  actionButton: CSSProperties;
  depositButton: CSSProperties;
  withdrawButton: CSSProperties;
  managePaymentButton: CSSProperties;
  paymentForm: CSSProperties;
  paymentGrid: CSSProperties;
  paymentInput: CSSProperties;
  savePaymentButton: CSSProperties;
  paymentMessage: CSSProperties;
};

export const dashboardStyles: DashboardStyleMap = {
  pageContainer: {
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: "14px 12px 20px",
    boxSizing: "border-box",
    background:
      "linear-gradient(145deg, #e8f8ee 0%, #8ad4a7 45%, #43a047 100%)",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "none",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "18px",
    border: "1px solid rgba(0, 0, 0, 0.07)",
    boxShadow: "0 24px 50px rgba(0, 0, 0, 0.14)",
    padding: "20px 14px",
    boxSizing: "border-box",
  },
  title: {
    margin: 0,
    color: "#0f3d1f",
    fontSize: "34px",
    lineHeight: 1.1,
  },
  subtitle: {
    margin: "10px 0 0",
    color: "#1f2933",
    fontSize: "18px",
  },
  emailText: {
    margin: "8px 0 0",
    color: "#475467",
    fontSize: "15px",
  },
  loadingText: {
    marginTop: "18px",
    color: "#334155",
  },
  errorText: {
    marginTop: "18px",
    color: "#b42318",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
    marginTop: "20px",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #d8e4ea",
    borderRadius: "14px",
    padding: "16px",
  },
  statLabel: {
    margin: "0 0 8px",
    color: "#475467",
    fontSize: "15px",
  },
  statValue: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
  },
  tokensCard: {
    marginTop: "16px",
    background: "#ffffff",
    border: "1px solid #d8e4ea",
    borderRadius: "12px",
    padding: "16px",
  },
  tokensLabel: {
    margin: "0 0 10px",
    color: "#475467",
    fontSize: "16px",
    fontWeight: 600,
  },
  tokensBalance: {
    margin: "0 0 16px",
    fontSize: "34px",
    fontWeight: 700,
    color: "#0f172a",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    flexDirection: "column",
    alignItems: "stretch",
  },
  actionButton: {
    border: "none",
    borderRadius: "10px",
    padding: "13px 14px",
    fontSize: "17px",
    minHeight: "50px",
    width: "100%",
    fontWeight: 700,
    color: "#ffffff",
    cursor: "pointer",
  },
  depositButton: {
    background: "#2e7d32",
  },
  withdrawButton: {
    background: "#c62828",
  },
  managePaymentButton: {
    background: "#1565c0",
  },
  paymentForm: {
    marginTop: "14px",
  },
  paymentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
  },
  paymentInput: {
    border: "1px solid #c8d2dc",
    borderRadius: "10px",
    padding: "13px 12px",
    fontSize: "16px",
    minHeight: "48px",
    width: "100%",
  },
  savePaymentButton: {
    marginTop: "10px",
    border: "none",
    borderRadius: "8px",
    padding: "9px 14px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#ffffff",
    background: "#1f2937",
  },
  paymentMessage: {
    margin: "8px 0 0",
    color: "#334155",
    fontSize: "13px",
  },
};
