export const saveResult = (data) => {
  const history = JSON.parse(localStorage.getItem("history")) || [];
  history.push({ ...data, date: new Date().toISOString() });
  localStorage.setItem("history", JSON.stringify(history));
};

export const getHistory = () => {
  return JSON.parse(localStorage.getItem("history")) || [];
};