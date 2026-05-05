const KEY = "health_history";

// ✅ Get cleaned history
export function getHistory() {
  const data = JSON.parse(localStorage.getItem(KEY)) || [];

  return data.filter(
    (item) =>
      item &&
      item.disease &&
      item.disease !== "Unknown" &&
      Number(item.health_score) > 0
  );
}

// ✅ Save result
export function saveResult(result) {
  const history = JSON.parse(localStorage.getItem(KEY)) || [];
  history.push(result);
  localStorage.setItem(KEY, JSON.stringify(history));
}

// ✅ Clear all history
export function clearHistory() {
  localStorage.removeItem(KEY);
}