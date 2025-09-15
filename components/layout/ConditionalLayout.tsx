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

  // For admin pages, only render children (admin layout will handle its own UI)
  if (isAdminPage) {
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
