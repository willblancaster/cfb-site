// =============================================
// SINGLE-FILE IMPLEMENTATION
// File: app/rankings/page.tsx
// Description: Self-contained Rankings UI (no API routes). Uses local JSON.
// Tabs: Current (side-by-side latest), CFP/AP/Coaches with Full-Season Matrix + Weekly toggle.
// =============================================
'use client';

import { useMemo, useState } from 'react';
import rankingsData from '@/data/rankings.sample.json';



// ---------- Types ----------

type PollKey = 'ap' | 'coaches' | 'cfp';

type RankRow = {
  rank: number;
  school: string;
  conference?: string;
  record?: string;
};

type WeekBlock = {
  week: number;
  poll: PollKey;
  season: number;
  released?: string;
  ranks: RankRow[];
};

type SeasonBundle = {
  latestWeek: number;
  weeks: WeekBlock[];
};

type RankingsData = Record<PollKey, Record<string, SeasonBundle>>;

const data = rankingsData as unknown as RankingsData;

// ---------- Helpers ----------

const POLL_LABEL: Record<PollKey, string> = { cfp: 'CFP', ap: 'AP', coaches: 'Coaches' };

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function getAllSeasonsForPoll(d: RankingsData, poll: PollKey) {
  return Object.keys(d[poll] ?? {}).map((y) => parseInt(y, 10)).sort((a, b) => b - a);
}

function getLatestWeekBlock(d: RankingsData, poll: PollKey): WeekBlock | null {
  const seasons = getAllSeasonsForPoll(d, poll);
  for (const season of seasons) {
    const bundle = d[poll]?.[String(season)];
    if (!bundle) continue;
    const wk = bundle.weeks.find((w) => w.week === bundle.latestWeek);
    if (wk) return wk;
  }
  return null;
}

// ---------- UI Pieces ----------

function RankingsTable({ data }: { data: WeekBlock | null }) {
  if (!data) return <div className="text-sm text-gray-500">No data.</div>;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-[520px] w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left">Rank</th>
            <th className="px-3 py-2 text-left">Team</th>
            <th className="px-3 py-2 text-left">Conf</th>
            <th className="px-3 py-2 text-left">Record</th>
          </tr>
        </thead>
        <tbody>
          {data.ranks.map((r) => (
            <tr key={r.rank} className="odd:bg-white even:bg-gray-50">
              <td className="px-3 py-2 font-semibold">{r.rank}</td>
              <td className="px-3 py-2">{r.school}</td>
              <td className="px-3 py-2">{r.conference ?? ''}</td>
              <td className="px-3 py-2">{r.record ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SeasonMatrix({ weeks, title }: { weeks: WeekBlock[]; title?: string }) {
  const sortedWeeks = useMemo(() => [...weeks].sort((a, b) => a.week - b.week), [weeks]);
  const maxRank = useMemo(() => sortedWeeks.reduce((m, w) => Math.max(m, w.ranks.length), 0), [sortedWeeks]);

  const cellMap = useMemo(() => {
    const map: Record<number, Record<number, string>> = {};
    for (const w of sortedWeeks) {
      map[w.week] = {};
      for (const r of w.ranks) map[w.week][r.rank] = r.school;
    }
    return map;
  }, [sortedWeeks]);

  return (
    <div className="space-y-2">
      {title && <div className="text-sm text-gray-600">{title}</div>}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="text-xs min-w-[900px]">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 bg-gray-50 px-2 py-2 text-left z-10">Rank</th>
              {sortedWeeks.map((w) => (
                <th key={w.week} className="px-2 py-2 text-center">W{w.week}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRank }, (_, i) => i + 1).map((rank) => (
              <tr key={rank} className={classNames(rank % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                <td className="sticky left-0 z-10 bg-white font-semibold px-2 py-1">{rank}</td>
                {sortedWeeks.map((w, idx) => {
                  const team = cellMap[w.week]?.[rank] ?? '';
                  const prevTeam = idx > 0 ? cellMap[sortedWeeks[idx - 1].week]?.[rank] : undefined;
                  const changed = prevTeam && prevTeam !== team;
                  return (
                    <td key={w.week}
                        title={team}
                        className={classNames('px-2 py-1 whitespace-nowrap align-middle text-[11px]', changed && 'underline')}
                    >
                      {team}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[11px] text-gray-500">Underline = change from previous week at that rank.</div>
    </div>
  );
}

function PollBrowser({ poll }: { poll: PollKey }) {
  const seasons = getAllSeasonsForPoll(data, poll);
  const [season, setSeason] = useState<number | null>(seasons[0] ?? null);
  const [viewMode, setViewMode] = useState<'matrix' | 'weekly'>('matrix');
  const [week, setWeek] = useState<number | 'latest'>('latest');

  const seasonBundle = season ? data[poll]?.[String(season)] ?? null : null;
  const weekList = useMemo(() => (seasonBundle?.weeks ?? []).map((w) => w.week), [seasonBundle]);

  const activeWeekData: WeekBlock | null = useMemo(() => {
    if (!seasonBundle) return null;
    const targetWeek = week === 'latest' ? seasonBundle.latestWeek : week;
    return seasonBundle.weeks.find((w) => w.week === targetWeek) ?? null;
  }, [seasonBundle, week]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-sm font-medium">Season</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={season ?? ''}
          onChange={(e) => setSeason(parseInt(e.target.value, 10))}
        >
          {seasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="h-4 w-px bg-gray-300" />
        <div className="inline-flex border rounded overflow-hidden">
          <button className={classNames('px-3 py-1 text-sm', viewMode === 'matrix' ? 'bg-black text-white' : 'bg-white')}
                  onClick={() => setViewMode('matrix')}>Full Season</button>
          <button className={classNames('px-3 py-1 text-sm border-l', viewMode === 'weekly' ? 'bg-black text-white' : 'bg-white')}
                  onClick={() => setViewMode('weekly')}>Weekly</button>
        </div>

        {viewMode === 'weekly' && (
          <>
            <div className="h-4 w-px bg-gray-300" />
            <button
              onClick={() => setWeek('latest')}
              className={classNames(
                'px-2 py-1 rounded text-sm border',
                week === 'latest' && 'bg-black text-white border-black'
              )}
            >Latest</button>
            <div className="flex flex-wrap gap-1 items-center">
              {weekList.map((w) => (
                <button
                  key={w}
                  onClick={() => setWeek(w)}
                  className={classNames(
                    'px-2 py-1 rounded text-sm border',
                    week !== 'latest' && w === week && 'bg-black text-white border-black'
                  )}
                >W{w}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {viewMode === 'matrix' && (
        <SeasonMatrix
          weeks={seasonBundle?.weeks ?? []}
          title={season ? `${POLL_LABEL[poll]} • ${season}` : undefined}
        />
      )}

      {viewMode === 'weekly' && (
        <>
          <div className="text-xs text-gray-500">{activeWeekData ? `${POLL_LABEL[poll]} • Week ${activeWeekData.week} • ${activeWeekData.season} ${activeWeekData.released ? '• ' + activeWeekData.released : ''}` : '—'}</div>
          <RankingsTable data={activeWeekData} />
        </>
      )}
    </div>
  );
}

function CurrentTriple() {
  const cfp = getLatestWeekBlock(data, 'cfp');
  const ap = getLatestWeekBlock(data, 'ap');
  const coaches = getLatestWeekBlock(data, 'coaches');
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <h3 className="font-semibold mb-2">CFP</h3>
        <RankingsTable data={cfp} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">AP</h3>
        <RankingsTable data={ap} />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Coaches</h3>
        <RankingsTable data={coaches} />
      </div>
    </div>
  );
}

export default function RankingsPage() {
  const [tab, setTab] = useState<'current' | PollKey>('current');

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rankings</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab('current')}
          className={classNames('px-3 py-1.5 rounded border', tab === 'current' && 'bg-black text-white border-black')}
        >Current</button>
        <button
          onClick={() => setTab('cfp')}
          className={classNames('px-3 py-1.5 rounded border', tab === 'cfp' && 'bg-black text-white border-black')}
        >CFP</button>
        <button
          onClick={() => setTab('ap')}
          className={classNames('px-3 py-1.5 rounded border', tab === 'ap' && 'bg-black text-white border-black')}
        >AP</button>
        <button
          onClick={() => setTab('coaches')}
          className={classNames('px-3 py-1.5 rounded border', tab === 'coaches' && 'bg-black text-white border-black')}
        >Coaches</button>
      </div>

      {tab === 'current' && <CurrentTriple />}
      {tab === 'cfp' && <PollBrowser poll="cfp" />}
      {tab === 'ap' && <PollBrowser poll="ap" />}
      {tab === 'coaches' && <PollBrowser poll="coaches" />}
    </div>
  );
}
/ /   t o u c h   t o   t r i g g e r   d e p l o y  
 