import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./main";
import { dashboardStyles as styles } from "./DashboardViewStyles";

export const DASHBOARD_VIEW_ID = "dashboard-view-container";

type DashboardStats = {
  userName: string;
  wins: number;
  win_balance: number;
};

function DashboardPanel() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setEmail("");
      setUserName("");
      setStats(null);
      setLoading(false);
      return;
    }

    setEmail(user.email ?? "");

    const metadataName =
      typeof user.user_metadata?.username === "string"
        ? user.user_metadata.username
        : "";

    setUserName(metadataName);

    const { data, error } = await supabase
      .from("UserData")
      .select("userName,wins,win_balance")
      .eq("uid", user.id)
      .maybeSingle();

    if (error) {
      setErrorMessage(error.message);
    } else if (data) {
      const resolvedName = data.userName || metadataName || "Player";
      setUserName(resolvedName);
      setStats({
        userName: resolvedName,
        wins: Number(data.wins ?? 0),
        win_balance: Number(data.win_balance ?? 0),
      });
    } else {
      setStats({
        userName: metadataName || "Player",
        wins: 0,
        win_balance: 0,
      });
    }

    setLoading(false);
  }

  useEffect(() => {
    async function bootstrapDashboard() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      await loadDashboard();
    }

    void bootstrapDashboard();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        void loadDashboard();
        return;
      }

      if (event === "SIGNED_OUT") {
        setEmail("");
        setUserName("");
        setStats(null);
        setErrorMessage("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h1 style={styles.title}>Dashboard</h1>

        <p style={styles.subtitle}>
          {userName ? `Welcome, ${userName}` : "Welcome"}
        </p>

        {email && <p style={styles.emailText}>Signed in as {email}</p>}

        {loading && <p style={styles.loadingText}>Loading profile...</p>}

        {!loading && errorMessage && (
          <p style={styles.errorText}>{errorMessage}</p>
        )}

        {!loading && !errorMessage && stats && (
          <>
            <div style={styles.statGrid}>
              <div style={styles.statCard}>
                <p style={styles.statLabel}>Username</p>
                <p style={styles.statValue}>{stats.userName}</p>
              </div>

              <div style={styles.statCard}>
                <p style={styles.statLabel}>Wins</p>
                <p style={styles.statValue}>{stats.wins}</p>
              </div>

              <div style={styles.statCard}>
                <p style={styles.statLabel}>Win Balance</p>
                <p style={styles.statValue}>{stats.win_balance}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export async function createDashboardView(container: HTMLElement) {
  container.innerHTML = "";
  const root = createRoot(container);
  root.render(<DashboardPanel />);
  return root;
}
