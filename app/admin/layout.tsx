import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Admin Dashboard | FoxPassport',
  description: 'FoxPassport Admin Dashboard - Manage experiences, bookings, and users',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
