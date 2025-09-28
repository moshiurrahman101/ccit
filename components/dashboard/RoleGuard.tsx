'use client';

import { useAuth } from '@/components/providers/AuthProvider';

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null 
}: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Convenience components for common roles
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin']} fallback={fallback}>{children}</RoleGuard>;
}

export function MentorOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard allowedRoles={['mentor', 'admin']} fallback={fallback}>{children}</RoleGuard>;
}

export function StudentOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return <RoleGuard allowedRoles={['student', 'mentor', 'admin']} fallback={fallback}>{children}</RoleGuard>;
}
