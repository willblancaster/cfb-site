import { headers } from 'next/headers';

type Game = {
  id: string;
  week: number;
  date: string;
  away: string;
  home: string;
  time: string;
  neutral: string; // "Y" or "N"
  score: string;
};

async function getGames(): Promise<Game[]> {
  const h = await headers(); // ← add await
  const host = h.get('host')!;
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = `${protocol}://${host}/api/games`;
  const res = await fetch(url, { cache: 'no-store' });
  return res.json();
}


export default async function SchedulesPage() {
  const games = await getGames();

  return (
    <div>
      <h1 className="h1">Schedules — Placeholder</h1>
      <div className="panel" style={{ marginBottom: 16 }}>
        Data is coming from <span className="code">/api/games</span>.
      </div>

      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Date</th>
              <th>Away</th>
              <th>Home</th>
              <th>Time</th>
              <th>Neutral</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {games.map(g => (
              <tr key={g.id}>
                <td>{g.week}</td>
                <td>{g.date}</td>
                <td>{g.away}</td>
                <td>{g.home}</td>
                <td>{g.time}</td>
                <td>{g.neutral}</td>
                <td>{g.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
