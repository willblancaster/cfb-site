import { headers } from 'next/headers';

type Row = { rank: number; team: string; record: string; conf: string };

async function getRankings(): Promise<Row[]> {
  const h = await headers(); // ← added await
  const host = h.get('host')!;
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = `${protocol}://${host}/api/rankings`;

  const res = await fetch(url, { cache: 'no-store' });
  return res.json();
}


export default async function RankingsPage() {
  const rows = await getRankings();

  return (
    <div>
      <h1 className="h1">AP Top 25 — Placeholder</h1>
      <div className="panel" style={{ marginBottom: 16 }}>
        Data is coming from <span className="code">/api/rankings</span>.
      </div>

      <div className="panel">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Record</th>
              <th>Conf</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rank}>
                <td>{r.rank}</td>
                <td>{r.team}</td>
                <td>{r.record}</td>
                <td>{r.conf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
