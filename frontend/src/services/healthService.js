const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error("VITE_API_URL is not configured.");
}

export async function checkApiHealth() {
  const response = await fetch(`${API_URL}/ready`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Prediction API is unavailable.");
  }

  const data = await response.json();

  if (
    data.status !== "ready" ||
    data.service !== "LAMESE AI"
  ) {
    throw new Error("Prediction API is unavailable.");
  }

  return data;
}