const API_URL = "https://YOUR-BACKEND-URL.onrender.com";

/**
 * Ensure a guest token exists
 * Silent, no UI
 */
export async function ensureGuestAuth(): Promise<string | null> {
  try {
    let token = localStorage.getItem("ulg_token");
    if (token) return token;

    const res = await fetch(`${API_URL}/api/auth/guest`, {
      method: "POST"
    });

    if (!res.ok) return null;

    const data = await res.json();
    localStorage.setItem("ulg_token", data.token);
    return data.token;
  } catch (err) {
    console.warn("Guest auth failed:", err);
    return null;
  }
}

/**
 * Sync progress to backend (fire-and-forget)
 */
export async function syncProgress(levelData: any): Promise<void> {
  try {
    const token = localStorage.getItem("ulg_token");
    if (!token) return;

    const completedLevels = Object.keys(levelData)
      .map(Number)
      .filter(n => !isNaN(n));

    const maxLevel =
      completedLevels.length > 0
        ? Math.max(...completedLevels) + 1
        : 1;

    const deaths = Number(localStorage.getItem("ulg_deaths") || 0);

    await fetch(`${API_URL}/api/progress/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        maxLevel,
        deaths
      })
    });
  } catch (err) {
    // NEVER crash the game
    console.warn("Progress sync failed:", err);
  }
}
