import './globals.css';
import Nav from './components/Nav';
import Shell from './components/Shell';

export const metadata = {
  title: 'College Football Tracker',
  description: 'Starter site for schedules, rankings, and standings',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

