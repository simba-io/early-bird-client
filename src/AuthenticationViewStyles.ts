import type { CSSProperties } from "react";

type AuthenticationStyleMap = {
  pageContainer: CSSProperties;
  card: CSSProperties;
  title: CSSProperties;
  modeToggleContainer: CSSProperties;
  modeButton: CSSProperties;
  modeButtonActive: CSSProperties;
  modeButtonInactive: CSSProperties;
  label: CSSProperties;
  input: CSSProperties;
  errorMessage: CSSProperties;
  submitButton: CSSProperties;
};

export const authenticationStyles: AuthenticationStyleMap = {
  pageContainer: {
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "22px 14px",
    background:
      "radial-gradient(circle at 20% 10%, #c2f0ff 0%, #70bdd7 35%, #1099bb 100%)",
    boxSizing: "border-box",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "none",
    background: "#ffffff",
    borderRadius: "18px",
    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.18)",
    padding: "26px 18px",
    boxSizing: "border-box",
  },
  title: {
    margin: "0 0 18px",
    color: "#10313b",
    fontSize: "32px",
    lineHeight: 1.1,
  },
  modeToggleContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "18px",
  },
  modeButton: {
    border: "1px solid #d0d7de",
    borderRadius: "10px",
    padding: "13px 10px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
  },
  modeButtonActive: {
    background: "#1099bb",
    color: "#ffffff",
  },
  modeButtonInactive: {
    background: "#f4f7f9",
    color: "#1f2933",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "15px",
    fontWeight: 600,
    color: "#1f2933",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #c8d2dc",
    borderRadius: "10px",
    padding: "13px 14px",
    marginBottom: "16px",
    fontSize: "16px",
    minHeight: "48px",
    outlineColor: "#1099bb",
  },
  errorMessage: {
    margin: "0 0 12px",
    color: "#b42318",
    fontSize: "14px",
  },
  submitButton: {
    width: "100%",
    border: "none",
    borderRadius: "10px",
    padding: "14px",
    fontSize: "18px",
    minHeight: "50px",
    fontWeight: 700,
    background: "#1099bb",
    color: "#ffffff",
  },
};
