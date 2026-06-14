import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./main";
import { leaderBoardsStyles as styles } from "./LeaderBoardsStyles";

export const LEADERBOARDS_VIEW_ID = "leaderboards-view-container";

type LeaderboardEntry = {
  uid: string;
  userName: string;
  wins: number;
  win_balance: number;
};

function LeaderboardsPanel() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("UserData")
          .select("uid,userName,wins")
          .order("wins", { ascending: false })
          .limit(50);

        if (error) {
          setErrorMessage(error.message);
        } else if (data) {
          setEntries(data as LeaderboardEntry[]);
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load leaderboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadLeaderboard();
  }, []);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h1 style={styles.title}>Leaderboards</h1>
        <p style={styles.subtitle}>Top players ranked by wins</p>

        {loading && <p style={styles.loadingText}>Loading leaderboard...</p>}

        {!loading && errorMessage && (
          <p style={styles.errorText}>{errorMessage}</p>
        )}

        {!loading && !errorMessage && entries.length === 0 && (
          <p style={styles.loadingText}>No players found yet.</p>
        )}

        {!loading && !errorMessage && entries.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead style={styles.tableHeader}>
                <tr>
                  <th style={styles.tableHeaderCell}>Rank</th>
                  <th style={styles.tableHeaderCell}>Player</th>
                  <th style={{ ...styles.tableHeaderCell, textAlign: "right" }}>
                    Wins
                  </th>
                  <th style={{ ...styles.tableHeaderCell, textAlign: "right" }}>
                    Win Balance
                  </th>
                </tr>
              </thead>
              <tbody style={styles.tableBody}>
                {entries.map((entry, index) => (
                  <tr
                    key={entry.uid}
                    style={{
                      ...styles.tableRow,
                      ...(index % 2 === 1 ? styles.tableRowAlt : {}),
                    }}
                  >
                    <td style={{ ...styles.tableCell, ...styles.rankCell }}>
                      <div
                        style={{
                          ...styles.rankBadge,
                          ...(index < 3 ? styles.topThreeRank : {}),
                        }}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td style={{ ...styles.tableCell, ...styles.nameCell }}>
                      {entry.userName || "Anonymous"}
                    </td>
                    <td style={{ ...styles.tableCell, ...styles.statCell }}>
                      {entry.wins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export async function createLeaderboardsView(container: HTMLElement) {
  container.innerHTML = "";
  const root = createRoot(container);
  root.render(<LeaderboardsPanel />);
  return root;
}
