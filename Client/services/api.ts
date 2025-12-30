const API_URL = "https://ultimate-level-game.onrender.com";

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

/**
 * Reset local progress keys only. Does NOT touch settings or cosmetics.
 * - Clears level progress map
 * - Resets deaths to 0
 * - Resets any local score key if present
 */
export function resetLocalProgress(): void {
  try {
    // Main level progress store
    localStorage.setItem('ultimateLevelChallenge_levelData', JSON.stringify({}));

    // Deaths counter
    localStorage.setItem('ulg_deaths', '0');

    // Optional score key -- only clear if present to avoid touching unrelated keys
    if (localStorage.getItem('ulg_score') !== null) {
      localStorage.setItem('ulg_score', '0');
    }

    // Do NOT touch cosmetics, settings, tokens, or tutorial flags
  } catch (err) {
    console.warn('Failed to reset local progress:', err);
  }
}

/**
 * Upload a reset command to the backend. Backend will overwrite stored progress with defaults.
 * This is fire-and-forget; if it fails the local reset still applies.
 */
export async function uploadResetToServer(): Promise<void> {
  try {
    const token = await ensureGuestAuth();
    if (!token) return;

    await fetch(`${API_URL}/api/progress/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
  } catch (err) {
    console.warn('Failed to upload reset to server:', err);
  }
}

/**
 * Fetch progress from backend and apply to localStorage.
 * Called on login/app start to sync authoritative backend state to device.
 */
export async function fetchProgressFromServer(): Promise<void> {
  try {
    const token = await ensureGuestAuth();
    if (!token) return;

    const res = await fetch(`${API_URL}/api/progress`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;
    const data = await res.json();

    // Expected shape from backend: {
    //   highestLevelUnlocked: number,
    //   completedLevels: number[],
    //   deaths: number,
    //   score: number
    // }

    const highest = Number(data.highestLevelUnlocked || 1);
    const deaths = Number(data.deaths || 0);
    const completed: number[] = Array.isArray(data.completedLevels) ? data.completedLevels.map(Number).filter(n => !isNaN(n)) : [];
    const score = Number(data.score || 0);

    // Build levelData object used by the client. We mark completed levels with an empty object
    // (client interprets existence of a key as progress). We also ensure levels up to
    // highestLevelUnlocked are present so they appear unlocked on device.
    const levelData: Record<string, any> = {};

    // Mark completed levels
    for (const lvl of completed) {
      if (lvl >= 1) levelData[String(lvl)] = levelData[String(lvl)] || {};
    }

    // Ensure unlocked levels exist (levels are 1-based; unlocked means up to highest-1 completed or available)
    for (let i = 1; i <= Math.max(1, highest - 1); i++) {
      levelData[String(i)] = levelData[String(i)] || {};
    }

    localStorage.setItem('ultimateLevelChallenge_levelData', JSON.stringify(levelData));
    localStorage.setItem('ulg_deaths', String(deaths));
    // Persist authoritative score from server
    localStorage.setItem('ulg_score', String(score));

  } catch (err) {
    console.warn('Failed to fetch progress from server:', err);
  }
}

/*
  Notes - Local vs Cloud responsibility and offline fallback:
  - Local: `ultimateLevelChallenge_levelData`, `ulg_deaths`, `ulg_score` are the client-side authoritative
    sources while offline. Players can play and progress locally without network access.
  - Cloud: `/api/progress` is the authoritative source after login/startup. On app start we pull from
    the cloud and overwrite only the game-progress keys above so user settings remain intact.
  - Offline fallback: If network calls fail, the localStorage values remain untouched and gameplay
    continues. Reset is user-initiated and always resets local state even when the backend call fails.
*/
