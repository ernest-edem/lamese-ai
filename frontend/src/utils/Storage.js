const KEY = "health_history";

// =========================
// ✅ GET HISTORY
// =========================
export function getHistory() {
  try {
    const raw = localStorage.getItem(KEY);

    // ✅ Prevent null crash
    if (!raw) return [];

    const data = JSON.parse(raw);

    // ✅ Ensure array
    if (!Array.isArray(data)) return [];

    // ✅ Clean corrupted / invalid records
    return data.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.disease &&
        item.disease !== "Unknown" &&
        item.health_score !== undefined &&
        item.health_score !== null &&
        !isNaN(Number(item.health_score))
    );
  } catch (err) {
    console.error("History parse error:", err);

    // ✅ Prevent app crash if localStorage corrupted
    return [];
  }
}

// =========================
// ✅ SAVE RESULT
// =========================
export function saveResult(result) {
  try {
    // ✅ Validate before saving
    if (
      !result ||
      typeof result !== "object" ||
      !result.disease
    ) {
      console.error("Invalid result not saved:", result);
      return;
    }

    const history = getHistory();

    // ✅ Auto timestamp
    const finalResult = {
      ...result,
      date:
        result.date ||
        new Date().toLocaleString(),
    };

    // ✅ Add newest first
    history.unshift(finalResult);

    // ✅ Limit history size
    const limitedHistory = history.slice(0, 20);

    localStorage.setItem(
      KEY,
      JSON.stringify(limitedHistory)
    );
  } catch (err) {
    console.error("Save history error:", err);
  }
}

// =========================
// ✅ CLEAR HISTORY
// =========================
export function clearHistory() {
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    console.error("Clear history error:", err);
  }
}