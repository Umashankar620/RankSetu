export default function CounsellingTimeline({ darkMode }) {
    const rounds = [
      { name: 'Round 1', date: 'August 2026 (expected)' },
      { name: 'Round 2', date: 'September 2026' },
      { name: 'Mop-Up Round', date: 'October 2026' },
      { name: 'Stray Vacancy', date: 'November 2026' },
    ];
    return (
      <div className="p-6">
        <h1 className="text-2xl font-black">NEET UG Counselling Timeline (MCC)</h1>
        <ul className="mt-4 space-y-3">
          {rounds.map(r => (
            <li key={r.name} className="p-4 rounded-xl border" style={{ background: darkMode ? '#1e293b' : '#f8fafc' }}>
              <strong>{r.name}</strong> – {r.date}
            </li>
          ))}
        </ul>
      </div>
    );
  }