import { createElement, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

export const MENU_CANVAS_ID = "menu-canvas-container";

type MenuComponent = {
  label: string;
  id: string;
};

type MenuProps = {
  components: MenuComponent[];
  onNavigate?: (viewId: string) => void;
};

function getTabIcon(id: string, label: string) {
  const normalized = `${id} ${label}`.toLowerCase();
  if (normalized.includes("auth") || normalized.includes("login")) {
    return "[A]";
  }
  if (normalized.includes("dash")) {
    return "[D]";
  }
  if (normalized.includes("game")) {
    return "[G]";
  }
  if (normalized.includes("leader")) {
    return "[L]";
  }
  return "[•]";
}

const menuStyles = {
  wrapper: {
    position: "fixed",
    left: "0",
    right: "0",
    bottom: "0",
    zIndex: "1000",
    pointerEvents: "none",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
  },
  tabBar: {
    width: "100%",
    background: "rgba(23, 36, 44, 0.95)",
    boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.28)",
    borderTop: "1px solid rgba(255, 255, 255, 0.14)",
    padding: "10px 10px calc(10px + env(safe-area-inset-bottom, 0px))",
    boxSizing: "border-box",
    pointerEvents: "auto",
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    alignItems: "stretch",
    WebkitTapHighlightColor: "transparent",
  },
  tabButtonBase: {
    minWidth: "110px",
    flex: "1 1 0",
    minHeight: "52px",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    padding: "10px 12px",
    whiteSpace: "nowrap",
    transition: "transform 120ms ease, filter 120ms ease, opacity 120ms ease",
  },
  tabButtonActive: {
    background: "#22c55e",
    color: "#052e16",
  },
  tabButtonInactive: {
    background: "#2f4858",
    color: "#ffffff",
  },
  tabButtonPressed: {
    transform: "scale(0.97)",
    filter: "brightness(0.92)",
  },
  tabButtonContent: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  },
  tabIcon: {
    fontSize: "13px",
    letterSpacing: "0.2px",
    opacity: 0.95,
  },
  tabLabel: {
    fontSize: "15px",
  },
} as const;

function MenuPanel({ components, onNavigate }: MenuProps) {
  const getHashViewId = () => window.location.hash.slice(1);
  const resolveInitialActiveId = () => {
    const hashViewId = getHashViewId();
    const hashExists = components.some(
      (component) => component.id === hashViewId,
    );
    if (hashExists) {
      return hashViewId;
    }
    return components[0]?.id ?? "";
  };

  const [activeId, setActiveId] = useState<string>(resolveInitialActiveId);
  const [pressedId, setPressedId] = useState<string>("");

  useEffect(() => {
    const handleHashChange = () => {
      const hashViewId = getHashViewId();
      if (components.some((component) => component.id === hashViewId)) {
        setActiveId(hashViewId);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [components]);

  useEffect(() => {
    if (components.some((component) => component.id === activeId)) {
      return;
    }
    setActiveId(components[0]?.id ?? "");
  }, [activeId, components]);

  return createElement(
    "div",
    { style: menuStyles.wrapper },
    createElement(
      "nav",
      { style: menuStyles.tabBar, "aria-label": "Mobile navigation" },
      ...components.map((option) =>
        createElement(
          "button",
          {
            key: option.id,
            type: "button",
            style: {
              ...menuStyles.tabButtonBase,
              ...(activeId === option.id
                ? menuStyles.tabButtonActive
                : menuStyles.tabButtonInactive),
              ...(pressedId === option.id ? menuStyles.tabButtonPressed : {}),
            },
            onClick: () => {
              setActiveId(option.id);
              if (onNavigate) {
                onNavigate(option.id);
              }
            },
            onMouseDown: () => setPressedId(option.id),
            onMouseUp: () => setPressedId(""),
            onMouseLeave: () => setPressedId(""),
            onTouchStart: () => setPressedId(option.id),
            onTouchEnd: () => setPressedId(""),
            onTouchCancel: () => setPressedId(""),
            "aria-current": activeId === option.id ? "page" : undefined,
          },
          createElement(
            "span",
            { style: menuStyles.tabButtonContent },
            createElement(
              "span",
              { style: menuStyles.tabIcon, "aria-hidden": "true" },
              getTabIcon(option.id, option.label),
            ),
            createElement("span", { style: menuStyles.tabLabel }, option.label),
          ),
        ),
      ),
    ),
  );
}

export async function createMenuCanvas(
  container: HTMLElement,
  components: MenuComponent[],
  onNavigate?: (viewId: string) => void,
) {
  container.innerHTML = "";

  const root = createRoot(container);
  root.render(createElement(MenuPanel, { components, onNavigate }));

  return () => {
    root.unmount();
    container.innerHTML = "";
  };
}
