'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/schedules', label: 'Schedules' },
  { href: '/standings', label: 'Standings' },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="header">
      <div className="container nav">
        <div className="brand">🏈 College Football Tracker</div>
        <div style={{ flex: 1 }} />
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname === l.href ? 'active' : undefined}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
