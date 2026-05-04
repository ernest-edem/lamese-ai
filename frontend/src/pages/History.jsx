export default function History() {
  const mock = [
    { disease: "Flu", score: 78 },
    { disease: "Cold", score: 90 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">History</h1>

      <div className="grid gap-4">
        {mock.map((item, i) => (
          <div key={i} className="p-4 bg-white rounded shadow">
            {item.disease} - {item.score}
          </div>
        ))}
      </div>
    </div>
  );
}