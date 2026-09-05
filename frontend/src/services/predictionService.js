const API_URL = "http://localhost:8000";

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