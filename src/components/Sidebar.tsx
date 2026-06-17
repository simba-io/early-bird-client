import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase";

type NavItem = {
  label: string;
  path: string;
  icon: string;
  requireAuth?: boolean;
  requirePaid?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", path: "/", icon: "🏠" },
  { label: "Contact", path: "/contact", icon: "📬" },
  { label: "About", path: "/about", icon: "ℹ️" },
  { label: "Contact Sales", path: "/contact-sales", icon: "💼" },
  { label: "Dashboard", path: "/dashboard", icon: "📊", requireAuth: true, requirePaid: true },
  { label: "Account", path: "/account", icon: "⚙️", requireAuth: true },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const { user, isPaid } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.requirePaid && !isPaid) return false;
    if (item.requireAuth && !user) return false;
    return true;
  });

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/auth");
  }

  return (
    <aside className={`sidebar ${expanded ? "sidebar--expanded" : "sidebar--collapsed"}`}>
      <button
        className="sidebar__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {expanded ? "◀" : "▶"}
      </button>

      {expanded && (
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">🐦</span>
          <span className="sidebar__logo-text">Early Bird</span>
        </div>
      )}

      <nav className="sidebar__nav">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? "sidebar__link--active" : ""}`
            }
          >
            <span className="sidebar__link-icon">{item.icon}</span>
            {expanded && <span className="sidebar__link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="sidebar__footer">
          {expanded && (
            <span className="sidebar__user-email" title={user.email}>
              {user.email}
            </span>
          )}
          <button className="sidebar__signout" onClick={handleSignOut} title="Sign out">
            {expanded ? "Sign out" : "↩"}
          </button>
        </div>
      )}
    </aside>
  );
}
