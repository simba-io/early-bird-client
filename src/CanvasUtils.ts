// CanvasUtils.ts - Standardized React rendering utilities
import { createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";

export interface CanvasConfig
{
  backgroundColor: string;
  containerId: string;
  width?: number;
  height?: number;
}

export interface ViewContentProvider
{
  setupContent(container?: HTMLElement): Promise<void> | void;
  renderContent?(): ReactNode;
}

export interface ReactCanvasApp
{
  root: Root;
  host: HTMLElement;
  destroy(): void;
}

export const CANVAS_STYLES = {
  width: "100%",
  height: "100%",
  marginTop: "0",
  marginBottom: "0",
} as const;

const bunnyAnimationStyleId = "standard-canvas-bunny-spin";

function ensureStandardCanvasStyles()
{
  if (document.getElementById(bunnyAnimationStyleId))
  {
    return;
  }

  const styleTag = document.createElement("style");

  styleTag.id = bunnyAnimationStyleId;

  styleTag.textContent = `
    @keyframes standardCanvasSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleTag);
}

function createHostElement(container: HTMLElement, config: CanvasConfig)
{
  const host = document.createElement("div");

  host.id = `${config.containerId}-react-host`;

  host.style.width = config.width ? `${config.width}px` : "100%";

  host.style.height = config.height ? `${config.height}px` : "100%";

  host.style.background = config.backgroundColor;

  host.style.display = "flex";

  host.style.alignItems = "center";

  host.style.justifyContent = "center";

  host.style.overflow = "hidden";

  container.innerHTML = "";

  container.appendChild(host);

  return host;
}

export async function createStandardCanvas(container: HTMLElement, config: CanvasConfig): Promise<ReactCanvasApp>
{
  ensureStandardCanvasStyles();

  const host = createHostElement(container, config);

  const root = createRoot(host);

  const bunnyStyle = {
    width: "120px",
    height: "120px",
    animation: "standardCanvasSpin 2.4s linear infinite",
    userSelect: "none",
    filter: "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2))",
  };

  root.render(
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      createElement("img", {
        src: "/assets/bunny.png",
        alt: "Spinning bunny",
        style: bunnyStyle,
      }),
    ),
  );

  return {
    root,
    host,
    destroy()
    {
      root.unmount();

      if (host.parentElement)
      {
        host.parentElement.removeChild(host);
      }
    },
  };
}

export async function createCustomCanvas(container: HTMLElement, config: CanvasConfig, contentProvider: ViewContentProvider): Promise<ReactCanvasApp>
{
  const host = createHostElement(container, config);

  const root = createRoot(host);

  const contentRoot = document.createElement("div");

  contentRoot.style.width = "100%";

  contentRoot.style.height = "100%";

  contentRoot.style.display = "flex";

  contentRoot.style.alignItems = "center";

  contentRoot.style.justifyContent = "center";

  const staticContent = contentProvider.renderContent?.() ?? null;

  root.render(
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          position: "relative",
        },
      },
      staticContent,
    ),
  );

  host.appendChild(contentRoot);

  await contentProvider.setupContent(contentRoot);

  return {
    root,
    host,
    destroy() {
      root.unmount();
      if (host.parentElement) {
        host.parentElement.removeChild(host);
      }
    },
  };
}

export function createCanvasContainer(parentElement: HTMLElement, containerId: string): HTMLElement
{
  const container = document.createElement("div");

  container.style.margin = "0";

  container.style.padding = "0";

  container.style.border = "0";

  container.style.width = "100vw";

  container.style.height = "100vh";

  container.style.display = "block";

  container.style.overflow = "hidden";

  container.id = containerId;

  parentElement.appendChild(container);
  
  return container;
}
