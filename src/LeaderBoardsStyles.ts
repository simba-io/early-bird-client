import type { CSSProperties } from "react";

type LeaderBoardsStyleMap = {
  pageContainer: CSSProperties;
  card: CSSProperties;
  title: CSSProperties;
  subtitle: CSSProperties;
  loadingText: CSSProperties;
  errorText: CSSProperties;
  tableWrapper: CSSProperties;
  table: CSSProperties;
  tableHeader: CSSProperties;
  tableHeaderCell: CSSProperties;
  tableBody: CSSProperties;
  tableRow: CSSProperties;
  tableRowAlt: CSSProperties;
  tableCell: CSSProperties;
  rankCell: CSSProperties;
  nameCell: CSSProperties;
  statCell: CSSProperties;
  rankBadge: CSSProperties;
  topThreeRank: CSSProperties;
};

export const leaderBoardsStyles: LeaderBoardsStyleMap = {
  pageContainer: {
    minHeight: "100dvh",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: "14px 12px 20px",
    boxSizing: "border-box",
    background:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "none",
    background: "rgba(255, 255, 255, 0.92)",
    borderRadius: "18px",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    boxShadow: "0 24px 50px rgba(0, 0, 0, 0.14)",
    padding: "20px 14px",
    boxSizing: "border-box",
  },
  title: {
    margin: 0,
    color: "#0f3460",
    fontSize: "34px",
    lineHeight: 1.1,
    fontWeight: 800,
  },
  subtitle: {
    margin: "10px 0 0",
    color: "#1f2933",
    fontSize: "16px",
  },
  loadingText: {
    marginTop: "18px",
    color: "#334155",
    fontSize: "16px",
  },
  errorText: {
    marginTop: "18px",
    color: "#b42318",
    fontSize: "16px",
  },
  tableWrapper: {
    marginTop: "18px",
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "15px",
  },
  tableHeader: {
    background: "rgba(15, 52, 96, 0.08)",
    borderBottom: "2px solid rgba(15, 52, 96, 0.16)",
  },
  tableHeaderCell: {
    padding: "12px 10px",
    textAlign: "left",
    fontWeight: 700,
    color: "#0f3460",
    fontSize: "14px",
  },
  tableBody: {
    display: "table-row-group",
  },
  tableRow: {
    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
    transition: "background-color 120ms ease",
  },
  tableRowAlt: {
    background: "rgba(15, 52, 96, 0.03)",
  },
  tableCell: {
    padding: "12px 10px",
    color: "#1f2933",
  },
  rankCell: {
    fontWeight: 700,
    minWidth: "45px",
  },
  nameCell: {
    fontWeight: 600,
  },
  statCell: {
    textAlign: "right",
    minWidth: "60px",
  },
  rankBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#e0e7ff",
    color: "#3730a3",
    fontWeight: 700,
    fontSize: "13px",
  },
  topThreeRank: {
    background: "#fbbf24",
    color: "#78350f",
  },
};
