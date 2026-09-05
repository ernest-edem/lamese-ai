const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    "VITE_API_URL is not configured."
  );
}

export async function predictPatient(patient) {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patient),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Prediction request failed."
    );
  }

  return data;
}