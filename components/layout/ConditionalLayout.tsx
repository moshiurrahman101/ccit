'use client';

import { usePathname } from 'next/navigation';
import { TopContactBar } from './TopContactBar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');
  const isDashboardPage = pathname.startsWith('/dashboard');

  // For admin pages and dashboard pages, only render children (they have their own layouts)
  if (isAdminPage || isDashboardPage) {
    return <>{children}</>;
  }

  // For frontend pages, render with header and footer
  return (
    <>
      <TopContactBar />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
