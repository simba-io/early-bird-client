import { createMenuCanvas, MENU_CANVAS_ID } from "./MenuCanvas";
import { createCanvasContainer } from "./CanvasUtils";
import { DASHBOARD_VIEW_ID, createDashboardView } from "./DashboardView.tsx";
import {
  AUTHENTICATION_VIEW_ID,
  createAuthenticationView,
} from "./AuthenticationView.tsx";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

const components = [
  { label: "Login / Register", id: AUTHENTICATION_VIEW_ID },
  { label: "Dashboard", id: DASHBOARD_VIEW_ID }
];

// View manager to handle navigation between pages
const viewContainers: Map<string, HTMLElement> = new Map();
let isAuthenticated = false;
let logoutButton: HTMLButtonElement | null = null;
let topBar: HTMLDivElement | null = null;
let menuContainer: HTMLDivElement | null = null;
let destroyMenuCanvas: (() => void) | null = null;
let destroyDropTimer: (() => void) | null = null;
let gamesViewContainerRef: HTMLElement | null = null;

async function renderMenu(authenticated: boolean) {
  if (!menuContainer) return;

  if (destroyMenuCanvas) {
    destroyMenuCanvas();
    destroyMenuCanvas = null;
  }

  menuContainer.innerHTML = "";
  const visibleComponents = authenticated
    ? components.filter((component) => component.id !== AUTHENTICATION_VIEW_ID)
    : components.filter((component) => component.id === AUTHENTICATION_VIEW_ID);

  destroyMenuCanvas = await createMenuCanvas(
    menuContainer,
    visibleComponents,
    showView,
  );
}

function setAuthenticatedUI(authenticated: boolean) {
  isAuthenticated = authenticated;

  const authenticationContainer = viewContainers.get(AUTHENTICATION_VIEW_ID);
  if (authenticationContainer) {
    authenticationContainer.style.display = authenticated ? "none" : "block";
  }

  if (logoutButton) {
    logoutButton.style.display = authenticated ? "block" : "none";
  }

  if (topBar) {
    topBar.style.display = authenticated ? "flex" : "none";
  }

  viewContainers.forEach((container) => {
    container.style.boxSizing = "border-box";
    container.style.paddingTop = authenticated ? "62px" : "0";
    container.style.paddingBottom = "86px";
  });
}

function createTopBar() {
  const bar = document.createElement("div");
  bar.id = "top-utility-bar";
  bar.style.position = "fixed";
  bar.style.top = "0";
  bar.style.left = "0";
  bar.style.right = "0";
  bar.style.height = "56px";
  bar.style.display = "none";
  bar.style.alignItems = "center";
  bar.style.justifyContent = "flex-end";
  bar.style.gap = "8px";
  bar.style.padding = "8px 10px";
  bar.style.boxSizing = "border-box";
  bar.style.background = "rgba(15, 23, 42, 0.9)";
  bar.style.borderBottom = "1px solid rgba(255, 255, 255, 0.18)";
  bar.style.backdropFilter = "blur(8px)";
  bar.style.zIndex = "1200";

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Log out";
  button.style.padding = "10px 14px";
  button.style.border = "none";
  button.style.borderRadius = "10px";
  button.style.background = "#37474f";
  button.style.color = "#ffffff";
  button.style.fontSize = "15px";
  button.style.fontWeight = "700";
  button.style.cursor = "pointer";
  button.style.display = "none";
  button.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });

  document.body.appendChild(bar);

  topBar = bar;
  logoutButton = button;
}

function showView(viewId: string) {
  if (isAuthenticated && viewId === AUTHENTICATION_VIEW_ID) {
    viewId = DASHBOARD_VIEW_ID;
  }

  if (
    !isAuthenticated &&
    viewId !== AUTHENTICATION_VIEW_ID
  ) {
    viewId = AUTHENTICATION_VIEW_ID;
  }

  // Hide all views
  viewContainers.forEach((container) => {
    container.style.display = "none";
  });
  // Show the selected view
  const selectedView = viewContainers.get(viewId);
  if (selectedView) {
    selectedView.style.display = "block";
    // Update URL hash for browser history
    window.location.hash = viewId;
  }
}

(async () => {
  createTopBar();

  // Create and mount the menu canvas (left side)
  menuContainer = document.createElement("div");
  menuContainer.id = MENU_CANVAS_ID;
  document.body.appendChild(menuContainer);

  // Create all canvases using standardized container creation
  const mainContainer = document.body;

  // Create dashboard view with standardized styling
  const dashboardContainer = createCanvasContainer(
    mainContainer,
    DASHBOARD_VIEW_ID,
  );

  await createDashboardView(dashboardContainer);

  viewContainers.set(DASHBOARD_VIEW_ID, dashboardContainer);

  // Create authentication view with standardized styling
  const authenticationContainer = createCanvasContainer(
    mainContainer,
    AUTHENTICATION_VIEW_ID,
  );

  await createAuthenticationView(authenticationContainer);

  viewContainers.set(AUTHENTICATION_VIEW_ID, authenticationContainer);

  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  setAuthenticatedUI(Boolean(session));
  await renderMenu(Boolean(session));

  // Show initial view
  if (session) {
    showView(DASHBOARD_VIEW_ID);
  } else {
    showView(AUTHENTICATION_VIEW_ID);
  }

  supabase.auth.onAuthStateChange((_event, sessionData) => {
    const authenticated = Boolean(sessionData);
    
    setAuthenticatedUI(authenticated);
    void renderMenu(authenticated);
    if (authenticated) {
      showView(DASHBOARD_VIEW_ID);
      return;
    }
    showView(AUTHENTICATION_VIEW_ID);
  });

  // Handle browser back/forward buttons
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.slice(1);
    if (viewContainers.has(hash)) {
      showView(hash);
    }
  });

  window.addEventListener("beforeunload", () => {
    if (destroyDropTimer) {
      destroyDropTimer();
      destroyDropTimer = null;
    }
  });
})();
